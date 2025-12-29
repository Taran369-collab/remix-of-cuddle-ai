import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { 
  Heart, ArrowLeft, Trash2, MessageSquare, 
  Loader2, Plus, Edit2, Save, X 
} from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";

const messageSchema = z.string().trim().min(1, "Message cannot be empty").max(200, "Message must be less than 200 characters");

interface LoveMessage {
  id: string;
  message: string;
  is_active: boolean;
  display_order: number;
  created_at: string;
}

const AdminLoveMessages = () => {
  const { isAdmin, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  
  const [messages, setMessages] = useState<LoveMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newMessage, setNewMessage] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");

  useEffect(() => {
    if (!authLoading && !isAdmin) {
      navigate("/");
      return;
    }
    fetchMessages();
  }, [authLoading, isAdmin, navigate]);

  const fetchMessages = async () => {
    try {
      const { data, error } = await supabase
        .from("love_messages")
        .select("*")
        .order("display_order", { ascending: true });

      if (error) throw error;
      setMessages(data || []);
    } catch (err) {
      console.error("Error fetching messages:", err);
      toast.error("Failed to load messages");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdd = async () => {
    const result = messageSchema.safeParse(newMessage);
    if (!result.success) {
      toast.error(result.error.errors[0].message);
      return;
    }

    setIsAdding(true);
    try {
      const maxOrder = messages.length > 0 
        ? Math.max(...messages.map(m => m.display_order)) + 1 
        : 0;

      const { error } = await supabase
        .from("love_messages")
        .insert({
          message: result.data,
          display_order: maxOrder,
        });

      if (error) throw error;

      toast.success("Message added!");
      setNewMessage("");
      fetchMessages();
    } catch (err: any) {
      console.error("Add error:", err);
      toast.error(err.message || "Failed to add message");
    } finally {
      setIsAdding(false);
    }
  };

  const handleToggleActive = async (message: LoveMessage) => {
    try {
      const { error } = await supabase
        .from("love_messages")
        .update({ is_active: !message.is_active })
        .eq("id", message.id);

      if (error) throw error;
      
      setMessages(prev => 
        prev.map(m => m.id === message.id ? { ...m, is_active: !m.is_active } : m)
      );
    } catch (err: any) {
      console.error("Toggle error:", err);
      toast.error(err.message || "Failed to update message");
    }
  };

  const handleStartEdit = (message: LoveMessage) => {
    setEditingId(message.id);
    setEditValue(message.message);
  };

  const handleSaveEdit = async () => {
    if (!editingId) return;

    const result = messageSchema.safeParse(editValue);
    if (!result.success) {
      toast.error(result.error.errors[0].message);
      return;
    }

    try {
      const { error } = await supabase
        .from("love_messages")
        .update({ message: result.data })
        .eq("id", editingId);

      if (error) throw error;
      
      setMessages(prev => 
        prev.map(m => m.id === editingId ? { ...m, message: result.data } : m)
      );
      setEditingId(null);
      toast.success("Message updated!");
    } catch (err: any) {
      console.error("Update error:", err);
      toast.error(err.message || "Failed to update message");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this message?")) return;

    try {
      const { error } = await supabase
        .from("love_messages")
        .delete()
        .eq("id", id);

      if (error) throw error;
      
      setMessages(prev => prev.filter(m => m.id !== id));
      toast.success("Message deleted");
    } catch (err: any) {
      console.error("Delete error:", err);
      toast.error(err.message || "Failed to delete message");
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
              Love Messages
            </span>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Add New Message */}
        <div className="bg-card/80 backdrop-blur-sm rounded-2xl p-6 border border-rose-light/20 mb-8">
          <h2 className="font-display text-xl text-foreground mb-4 flex items-center gap-2">
            <Plus size={20} className="text-rose" />
            Add New Message
          </h2>
          
          <div className="flex gap-3">
            <Input
              placeholder="Enter a romantic message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              maxLength={200}
              onKeyDown={(e) => e.key === "Enter" && handleAdd()}
            />
            <Button
              variant="romantic"
              onClick={handleAdd}
              disabled={isAdding || !newMessage.trim()}
            >
              {isAdding ? <Loader2 className="animate-spin" size={18} /> : <Plus size={18} />}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            {newMessage.length}/200 characters
          </p>
        </div>

        {/* Messages List */}
        <div className="bg-card/80 backdrop-blur-sm rounded-2xl p-6 border border-rose-light/20">
          <h2 className="font-display text-xl text-foreground mb-4 flex items-center gap-2">
            <MessageSquare size={20} className="text-rose" />
            Messages ({messages.length})
          </h2>

          {messages.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <MessageSquare size={48} className="mx-auto mb-4 opacity-50" />
              <p>No messages yet. Add your first romantic message!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`p-4 rounded-xl border transition-all ${
                    message.is_active 
                      ? "bg-secondary/30 border-rose-light/30" 
                      : "bg-muted/30 border-muted/30 opacity-60"
                  }`}
                >
                  {editingId === message.id ? (
                    <div className="flex gap-2">
                      <Input
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        maxLength={200}
                        autoFocus
                      />
                      <Button variant="ghost" size="sm" onClick={handleSaveEdit}>
                        <Save size={16} />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => setEditingId(null)}>
                        <X size={16} />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between gap-4">
                      <p className="text-foreground flex-1">{message.message}</p>
                      <div className="flex items-center gap-2 shrink-0">
                        <div className="flex items-center gap-2">
                          <Label htmlFor={`active-${message.id}`} className="text-xs text-muted-foreground">
                            Active
                          </Label>
                          <Switch
                            id={`active-${message.id}`}
                            checked={message.is_active}
                            onCheckedChange={() => handleToggleActive(message)}
                          />
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleStartEdit(message)}
                        >
                          <Edit2 size={16} />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleDelete(message.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminLoveMessages;