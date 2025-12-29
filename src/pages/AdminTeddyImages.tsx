import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Heart, ArrowLeft, Upload, Trash2, Image as ImageIcon, 
  Loader2, Plus 
} from "lucide-react";
import { toast } from "sonner";

interface TeddyImage {
  id: string;
  url: string;
  pose_name: string;
  created_at: string;
}

const AdminTeddyImages = () => {
  const { isAdmin, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [images, setImages] = useState<TeddyImage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [poseName, setPoseName] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !isAdmin) {
      navigate("/");
      return;
    }
    fetchImages();
  }, [authLoading, isAdmin, navigate]);

  const fetchImages = async () => {
    try {
      const { data, error } = await supabase
        .from("teddy_images")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setImages(data || []);
    } catch (err) {
      console.error("Error fetching images:", err);
      toast.error("Failed to load images");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        toast.error("Please select an image file");
        return;
      }
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !poseName.trim()) {
      toast.error("Please select an image and enter a pose name");
      return;
    }

    setIsUploading(true);
    try {
      // Upload to storage
      const fileExt = selectedFile.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from("teddy-images")
        .upload(fileName, selectedFile);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from("teddy-images")
        .getPublicUrl(fileName);

      // Save to database
      const { error: dbError } = await supabase
        .from("teddy_images")
        .insert({
          url: urlData.publicUrl,
          pose_name: poseName.trim(),
        });

      if (dbError) throw dbError;

      toast.success("Image uploaded successfully!");
      setPoseName("");
      setSelectedFile(null);
      setPreviewUrl(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      fetchImages();
    } catch (err: any) {
      console.error("Upload error:", err);
      toast.error(err.message || "Failed to upload image");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (image: TeddyImage) => {
    if (!confirm(`Delete "${image.pose_name}"?`)) return;

    try {
      // Extract filename from URL
      const urlParts = image.url.split("/");
      const fileName = urlParts[urlParts.length - 1];

      // Delete from storage
      await supabase.storage.from("teddy-images").remove([fileName]);

      // Delete from database
      const { error } = await supabase
        .from("teddy_images")
        .delete()
        .eq("id", image.id);

      if (error) throw error;

      toast.success("Image deleted");
      fetchImages();
    } catch (err: any) {
      console.error("Delete error:", err);
      toast.error(err.message || "Failed to delete image");
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-dreamy flex items-center justify-center">
        <Loader2 className="animate-spin text-rose" size={32} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-dreamy">
      {/* Header */}
      <header className="bg-card/60 backdrop-blur-sm border-b border-rose-light/20 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => navigate("/admin")}>
              <ArrowLeft size={18} className="mr-1" />
              Back
            </Button>
            <Heart className="text-rose fill-current" size={24} />
            <span className="font-display text-xl text-foreground">
              Teddy Images
            </span>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Upload Section */}
        <div className="bg-card/80 backdrop-blur-sm rounded-2xl p-6 border border-rose-light/20 mb-8">
          <h2 className="font-display text-xl text-foreground mb-4 flex items-center gap-2">
            <Plus size={20} className="text-rose" />
            Upload New Image
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* File Input */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="pose-name">Pose Name</Label>
                <Input
                  id="pose-name"
                  placeholder="e.g. Cuddling Together"
                  value={poseName}
                  onChange={(e) => setPoseName(e.target.value)}
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="image-file">Image File</Label>
                <Input
                  ref={fileInputRef}
                  id="image-file"
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="mt-1"
                />
              </div>

              <Button
                variant="romantic"
                onClick={handleUpload}
                disabled={isUploading || !selectedFile || !poseName.trim()}
                className="w-full"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="mr-2 animate-spin" size={18} />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2" size={18} />
                    Upload Image
                  </>
                )}
              </Button>
            </div>

            {/* Preview */}
            <div className="flex items-center justify-center">
              {previewUrl ? (
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="max-h-48 rounded-xl object-cover shadow-romantic"
                />
              ) : (
                <div className="w-full h-48 bg-secondary/50 rounded-xl flex items-center justify-center text-muted-foreground">
                  <ImageIcon size={48} className="opacity-50" />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Image Gallery */}
        <div className="bg-card/80 backdrop-blur-sm rounded-2xl p-6 border border-rose-light/20">
          <h2 className="font-display text-xl text-foreground mb-4 flex items-center gap-2">
            <ImageIcon size={20} className="text-rose" />
            Image Gallery ({images.length})
          </h2>

          {images.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <ImageIcon size={48} className="mx-auto mb-4 opacity-50" />
              <p>No images uploaded yet</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {images.map((image) => (
                <div
                  key={image.id}
                  className="relative group bg-secondary/30 rounded-xl overflow-hidden border border-rose-light/20"
                >
                  <img
                    src={image.url}
                    alt={image.pose_name}
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-between p-3">
                    <span className="text-white text-sm font-medium truncate">
                      {image.pose_name}
                    </span>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(image)}
                      className="shrink-0"
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                  <div className="p-3 group-hover:hidden">
                    <p className="text-sm font-medium text-foreground truncate">
                      {image.pose_name}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminTeddyImages;