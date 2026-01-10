import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "@/components/ui/use-toast";
import { ArrowLeft, RefreshCw, Plus, DollarSign, Bitcoin, Wallet, Smartphone } from "lucide-react";
import { format } from "date-fns";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

interface WalletTransaction {
  id: string;
  wallet_type: string;
  transaction_hash: string | null;
  amount_native: number;
  amount_usd: number | null;
  sender_address: string | null;
  is_manual_entry: boolean;
  notes: string | null;
  transaction_date: string;
  created_at: string;
}

const COLORS = ['#f7931a', '#627eea', '#4ade80', '#94a3b8'];

const AdminRevenue = () => {
  const { isAdmin, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);

  // Form state
  const [formType, setFormType] = useState<string>("UPI");
  const [formAmount, setFormAmount] = useState<string>("");
  const [formSender, setFormSender] = useState<string>("");
  const [formNotes, setFormNotes] = useState<string>("");
  const [formDate, setFormDate] = useState<string>(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    if (!authLoading && !isAdmin) {
      navigate("/admin-auth");
    }
  }, [isAdmin, authLoading, navigate]);

  useEffect(() => {
    if (isAdmin) {
      fetchTransactions();
    }
  }, [isAdmin]);

  const fetchTransactions = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("wallet_transactions")
      .select("*")
      .order("transaction_date", { ascending: false });

    if (error) {
      toast({ title: "Error fetching transactions", description: error.message, variant: "destructive" });
    } else {
      setTransactions(data || []);
    }
    setLoading(false);
  };

  const syncBlockchain = async () => {
    setSyncing(true);
    try {
      const { data, error } = await supabase.functions.invoke("sync-wallet-transactions");
      if (error) throw error;
      toast({ title: "Sync Complete", description: `Synced ${data.synced.eth} ETH and ${data.synced.btc} BTC transactions` });
      await fetchTransactions();
    } catch (error: any) {
      toast({ title: "Sync Failed", description: error.message, variant: "destructive" });
    }
    setSyncing(false);
  };

  const handleAddManual = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Convert INR to USD for UPI (rough rate)
    const amount = parseFloat(formAmount);
    const amountUsd = formType === "UPI" ? amount / 83 : amount;

    const { error } = await supabase.from("wallet_transactions").insert({
      wallet_type: formType,
      amount_native: amount,
      amount_usd: amountUsd,
      sender_address: formSender || null,
      notes: formNotes || null,
      is_manual_entry: true,
      transaction_date: new Date(formDate).toISOString(),
    });

    if (error) {
      toast({ title: "Error adding transaction", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Transaction added successfully" });
      setShowAddForm(false);
      setFormAmount("");
      setFormSender("");
      setFormNotes("");
      await fetchTransactions();
    }
  };

  const stats = useMemo(() => {
    const totalUsd = transactions.reduce((sum, tx) => sum + (tx.amount_usd || 0), 0);
    const byType = transactions.reduce((acc, tx) => {
      acc[tx.wallet_type] = (acc[tx.wallet_type] || 0) + (tx.amount_usd || 0);
      return acc;
    }, {} as Record<string, number>);

    return { totalUsd, byType };
  }, [transactions]);

  const chartData = useMemo(() => {
    return Object.entries(stats.byType).map(([name, value]) => ({ name, value: Math.round(value * 100) / 100 }));
  }, [stats.byType]);

  const monthlyData = useMemo(() => {
    const grouped = transactions.reduce((acc, tx) => {
      const month = format(new Date(tx.transaction_date), 'MMM yyyy');
      acc[month] = (acc[month] || 0) + (tx.amount_usd || 0);
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(grouped)
      .map(([month, amount]) => ({ month, amount: Math.round(amount * 100) / 100 }))
      .slice(-12);
  }, [transactions]);

  if (authLoading || loading) {
    return <div className="min-h-screen flex items-center justify-center bg-background"><div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" /></div>;
  }

  const getWalletIcon = (type: string) => {
    switch (type) {
      case 'BTC': return <Bitcoin className="h-4 w-4 text-orange-500" />;
      case 'ETH': return <Wallet className="h-4 w-4 text-blue-500" />;
      case 'UPI': return <Smartphone className="h-4 w-4 text-green-500" />;
      default: return <DollarSign className="h-4 w-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/admin")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-2xl font-bold">Revenue Management</h1>
          </div>
          <div className="flex gap-2">
            <Button onClick={syncBlockchain} disabled={syncing} variant="outline">
              <RefreshCw className={`h-4 w-4 mr-2 ${syncing ? 'animate-spin' : ''}`} />
              Sync Blockchain
            </Button>
            <Button onClick={() => setShowAddForm(!showAddForm)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Manual Entry
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Revenue (USD)</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-primary">${stats.totalUsd.toFixed(2)}</p>
            </CardContent>
          </Card>
          {['BTC', 'ETH', 'UPI'].map((type) => (
            <Card key={type}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  {getWalletIcon(type)} {type} Revenue
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">${(stats.byType[type] || 0).toFixed(2)}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Add Manual Entry Form */}
        {showAddForm && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Add Manual Transaction</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddManual} className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div>
                  <Label>Type</Label>
                  <Select value={formType} onValueChange={setFormType}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="UPI">UPI (INR)</SelectItem>
                      <SelectItem value="BTC">Bitcoin</SelectItem>
                      <SelectItem value="ETH">Ethereum</SelectItem>
                      <SelectItem value="OTHER">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Amount {formType === "UPI" ? "(INR)" : "(USD)"}</Label>
                  <Input type="number" step="0.01" value={formAmount} onChange={(e) => setFormAmount(e.target.value)} required />
                </div>
                <div>
                  <Label>Sender ID (optional)</Label>
                  <Input value={formSender} onChange={(e) => setFormSender(e.target.value)} placeholder="UPI ID / Address" />
                </div>
                <div>
                  <Label>Date</Label>
                  <Input type="date" value={formDate} onChange={(e) => setFormDate(e.target.value)} required />
                </div>
                <div className="flex items-end">
                  <Button type="submit" className="w-full">Add Transaction</Button>
                </div>
                <div className="md:col-span-5">
                  <Label>Notes (optional)</Label>
                  <Textarea value={formNotes} onChange={(e) => setFormNotes(e.target.value)} placeholder="Additional notes..." />
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Charts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Revenue by Source</CardTitle>
            </CardHeader>
            <CardContent className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                    {chartData.map((_, index) => (
                      <Cell key={index} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `$${value}`} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Monthly Revenue</CardTitle>
            </CardHeader>
            <CardContent className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => `$${value}`} />
                  <Bar dataKey="amount" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Transactions Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Transactions ({transactions.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Amount (Native)</TableHead>
                  <TableHead>Amount (USD)</TableHead>
                  <TableHead>Sender</TableHead>
                  <TableHead>Source</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((tx) => (
                  <TableRow key={tx.id}>
                    <TableCell className="flex items-center gap-2">
                      {getWalletIcon(tx.wallet_type)}
                      {tx.wallet_type}
                    </TableCell>
                    <TableCell>{format(new Date(tx.transaction_date), 'PP')}</TableCell>
                    <TableCell>
                      {tx.amount_native.toFixed(tx.wallet_type === 'UPI' ? 2 : 8)}
                      {tx.wallet_type === 'UPI' ? ' INR' : tx.wallet_type === 'BTC' ? ' BTC' : ' ETH'}
                    </TableCell>
                    <TableCell>${(tx.amount_usd || 0).toFixed(2)}</TableCell>
                    <TableCell className="max-w-[150px] truncate">{tx.sender_address || '-'}</TableCell>
                    <TableCell>{tx.is_manual_entry ? 'Manual' : 'Blockchain'}</TableCell>
                  </TableRow>
                ))}
                {transactions.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                      No transactions yet. Sync blockchain or add manual entries.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminRevenue;
