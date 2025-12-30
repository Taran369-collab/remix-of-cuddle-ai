import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { ArrowLeft, Plus, Target, Trash2, Edit, Save, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Progress } from "@/components/ui/progress";

interface DonationGoal {
  id: string;
  goal_name: string;
  target_amount: number;
  current_amount: number;
  currency: string;
  is_active: boolean;
  created_at: string;
}

const AdminDonationGoals = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isAdmin } = useAuth();
  const [goals, setGoals] = useState<DonationGoal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ goal_name: "", target_amount: 0, current_amount: 0, currency: "INR" });
  const [showNewForm, setShowNewForm] = useState(false);
  const [newGoal, setNewGoal] = useState({ goal_name: "", target_amount: 0, currency: "INR" });

  useEffect(() => {
    if (!isAdmin) {
      navigate("/admin");
      return;
    }
    fetchGoals();
  }, [isAdmin, navigate]);

  const fetchGoals = async () => {
    const { data, error } = await supabase
      .from("donation_goals")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast({ title: "Error fetching goals", description: error.message, variant: "destructive" });
    } else {
      setGoals((data as DonationGoal[]) || []);
    }
    setIsLoading(false);
  };

  const handleCreate = async () => {
    if (!newGoal.goal_name || newGoal.target_amount <= 0) {
      toast({ title: "Invalid input", description: "Please fill all fields correctly", variant: "destructive" });
      return;
    }

    const { error } = await supabase.from("donation_goals").insert({
      goal_name: newGoal.goal_name,
      target_amount: newGoal.target_amount,
      currency: newGoal.currency,
    });

    if (error) {
      toast({ title: "Error creating goal", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Goal created successfully!" });
      setNewGoal({ goal_name: "", target_amount: 0, currency: "INR" });
      setShowNewForm(false);
      fetchGoals();
    }
  };

  const handleUpdate = async (id: string) => {
    const { error } = await supabase
      .from("donation_goals")
      .update({
        goal_name: editForm.goal_name,
        target_amount: editForm.target_amount,
        current_amount: editForm.current_amount,
        currency: editForm.currency,
      })
      .eq("id", id);

    if (error) {
      toast({ title: "Error updating goal", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Goal updated successfully!" });
      setEditingId(null);
      fetchGoals();
    }
  };

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    const { error } = await supabase
      .from("donation_goals")
      .update({ is_active: !currentStatus })
      .eq("id", id);

    if (error) {
      toast({ title: "Error updating status", description: error.message, variant: "destructive" });
    } else {
      fetchGoals();
    }
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("donation_goals").delete().eq("id", id);

    if (error) {
      toast({ title: "Error deleting goal", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Goal deleted successfully!" });
      fetchGoals();
    }
  };

  const startEditing = (goal: DonationGoal) => {
    setEditingId(goal.id);
    setEditForm({
      goal_name: goal.goal_name,
      target_amount: goal.target_amount,
      current_amount: goal.current_amount,
      currency: goal.currency,
    });
  };

  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-light/20 via-background to-love-light/20 p-4 md:p-8">
      <Helmet>
        <title>Donation Goals - Admin | Bear Love</title>
      </Helmet>

      <div className="max-w-4xl mx-auto">
        <Button variant="ghost" onClick={() => navigate("/admin")} className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>

        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Target className="h-8 w-8 text-rose" />
            <h1 className="text-3xl font-bold text-foreground">Donation Goals</h1>
          </div>
          <Button onClick={() => setShowNewForm(true)} disabled={showNewForm}>
            <Plus className="mr-2 h-4 w-4" />
            New Goal
          </Button>
        </div>

        {showNewForm && (
          <Card className="mb-6 border-rose/30">
            <CardHeader>
              <CardTitle>Create New Goal</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="goal_name">Goal Name</Label>
                <Input
                  id="goal_name"
                  value={newGoal.goal_name}
                  onChange={(e) => setNewGoal({ ...newGoal, goal_name: e.target.value })}
                  placeholder="e.g., Monthly Server Costs"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="target_amount">Target Amount</Label>
                  <Input
                    id="target_amount"
                    type="number"
                    value={newGoal.target_amount || ""}
                    onChange={(e) => setNewGoal({ ...newGoal, target_amount: Number(e.target.value) })}
                    placeholder="5000"
                  />
                </div>
                <div>
                  <Label htmlFor="currency">Currency</Label>
                  <Select value={newGoal.currency} onValueChange={(v) => setNewGoal({ ...newGoal, currency: v })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="INR">INR (₹)</SelectItem>
                      <SelectItem value="BTC">BTC</SelectItem>
                      <SelectItem value="ETH">ETH</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleCreate}>Create Goal</Button>
                <Button variant="outline" onClick={() => setShowNewForm(false)}>
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {isLoading ? (
          <p className="text-center text-muted-foreground">Loading...</p>
        ) : goals.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Target className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No donation goals yet. Create your first goal!</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {goals.map((goal) => {
              const percentage = Math.min(Math.round((goal.current_amount / goal.target_amount) * 100), 100);
              const isEditing = editingId === goal.id;

              return (
                <Card key={goal.id} className={goal.is_active ? "border-rose/30" : "opacity-60"}>
                  <CardContent className="pt-6">
                    {isEditing ? (
                      <div className="space-y-4">
                        <div>
                          <Label>Goal Name</Label>
                          <Input
                            value={editForm.goal_name}
                            onChange={(e) => setEditForm({ ...editForm, goal_name: e.target.value })}
                          />
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                          <div>
                            <Label>Current Amount</Label>
                            <Input
                              type="number"
                              value={editForm.current_amount}
                              onChange={(e) => setEditForm({ ...editForm, current_amount: Number(e.target.value) })}
                            />
                          </div>
                          <div>
                            <Label>Target Amount</Label>
                            <Input
                              type="number"
                              value={editForm.target_amount}
                              onChange={(e) => setEditForm({ ...editForm, target_amount: Number(e.target.value) })}
                            />
                          </div>
                          <div>
                            <Label>Currency</Label>
                            <Select value={editForm.currency} onValueChange={(v) => setEditForm({ ...editForm, currency: v })}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="INR">INR (₹)</SelectItem>
                                <SelectItem value="BTC">BTC</SelectItem>
                                <SelectItem value="ETH">ETH</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" onClick={() => handleUpdate(goal.id)}>
                            <Save className="mr-1 h-4 w-4" />
                            Save
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => setEditingId(null)}>
                            <X className="mr-1 h-4 w-4" />
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <h3 className="font-semibold text-lg">{goal.goal_name}</h3>
                            <p className="text-sm text-muted-foreground">
                              {goal.currency === "INR" ? "₹" : ""}{goal.current_amount.toLocaleString()}
                              {" / "}
                              {goal.currency === "INR" ? "₹" : ""}{goal.target_amount.toLocaleString()} {goal.currency}
                            </p>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                              <Label htmlFor={`active-${goal.id}`} className="text-sm">Active</Label>
                              <Switch
                                id={`active-${goal.id}`}
                                checked={goal.is_active}
                                onCheckedChange={() => handleToggleActive(goal.id, goal.is_active)}
                              />
                            </div>
                            <Button size="sm" variant="ghost" onClick={() => startEditing(goal)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="ghost" className="text-destructive" onClick={() => handleDelete(goal.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        <Progress value={percentage} className="h-3" />
                        <p className="text-right text-sm font-medium mt-2 text-rose">{percentage}%</p>
                      </>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDonationGoals;
