import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/src/context/AuthContext';
import { api } from '@/src/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { 
  Plus, 
  FileText, 
  Zap, 
  MessageSquare, 
  Image as ImageIcon, 
  Loader2,
  AlertCircle,
  CheckCircle2,
  Megaphone,
  Eye,
  Calendar
} from 'lucide-react';
import { ServiceTracker } from '@/src/components/ServiceTracker';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/lib/utils';

export const ConsumerDashboard: React.FC = () => {
  const { user, userData } = useAuth();
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // Form states
  const [requestType, setRequestType] = useState<'billing' | 'reconnection'>('billing');
  const [billingCategory, setBillingCategory] = useState('');
  const [description, setDescription] = useState('');
  const [isUrgent, setIsUrgent] = useState(false);
  const [checklist, setChecklist] = useState({
    paid: false,
    receiptReady: false,
    accessClear: false
  });

  const fetchData = async () => {
    try {
      const ticketsData = await api.tickets.list();
      setTickets(ticketsData);
    } catch (error: any) {
      console.error("Error fetching dashboard data:", error);
      toast.error("Failed to load dashboard data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) return;
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [user]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsSubmitting(true);
    try {
      await api.tickets.create({
        consumerName: userData?.fullName,
        accountNumber: userData?.accountNumber,
        type: requestType,
        category: requestType === 'billing' ? billingCategory : 'Reconnection',
        description,
        isUrgent,
        evidenceImage: previewImage,
        checklist: requestType === 'reconnection' ? checklist : null,
      });

      toast.success('Request submitted successfully!');
      setPreviewImage(null);
      setDescription('');
      setBillingCategory('');
      setIsUrgent(false);
      fetchData();
    } catch (error: any) {
      console.error(error);
      toast.error('Failed to submit request.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Consumer Dashboard</h1>
          <p className="text-slate-500">Welcome back, {userData?.fullName}</p>
        </div>
        
        <Dialog>
          <DialogTrigger render={
            <Button className="bg-primary hover:bg-primary/90 text-white gap-2 rounded-full px-6">
              <Plus className="h-5 w-5" /> New Service Request
            </Button>
          } />
          <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Request</DialogTitle>
              <DialogDescription>
                Select the type of service you need and provide the details.
              </DialogDescription>
            </DialogHeader>
            
            <Tabs defaultValue="billing" onValueChange={(v) => setRequestType(v as any)}>
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="billing" className="gap-2">
                  <FileText className="h-4 w-4" /> Billing Dispute
                </TabsTrigger>
                <TabsTrigger value="reconnection" className="gap-2">
                  <Zap className="h-4 w-4" /> Reconnection
                </TabsTrigger>
              </TabsList>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <TabsContent value="billing" className="space-y-4 mt-0">
                  <div className="space-y-2">
                    <Label>Dispute Category</Label>
                    <Select onValueChange={setBillingCategory} required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="overcharge">Overcharging / High Bill</SelectItem>
                        <SelectItem value="wrong-reading">Wrong Meter Reading</SelectItem>
                        <SelectItem value="payment-not-reflected">Payment Not Reflected</SelectItem>
                        <SelectItem value="other">Other Billing Issue</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </TabsContent>
                
                <TabsContent value="reconnection" className="space-y-4 mt-0">
                  <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 space-y-3">
                    <Label className="text-sm font-bold flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-primary" /> Pre-submission Checklist
                    </Label>
                    <div className="space-y-2">
                      {[
                        { id: 'paid', label: 'I have paid all outstanding balances' },
                        { id: 'receiptReady', label: 'I have the proof of payment ready' },
                        { id: 'accessClear', label: 'Meter area is accessible for crew' }
                      ].map((item) => (
                        <div key={item.id} className="flex items-center gap-2">
                          <input 
                            type="checkbox" 
                            id={item.id}
                            className="rounded border-slate-300 text-primary focus:ring-primary"
                            onChange={(e) => setChecklist({...checklist, [item.id]: e.target.checked})}
                            required
                          />
                          <Label htmlFor={item.id} className="text-xs font-normal cursor-pointer">
                            {item.label}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                </TabsContent>

                <div className="flex items-center space-x-2 bg-red-50 p-3 rounded-lg border border-red-100">
                  <input 
                    type="checkbox" 
                    id="isUrgent" 
                    className="rounded border-red-300 text-red-600 focus:ring-red-500 h-4 w-4"
                    checked={isUrgent}
                    onChange={(e) => setIsUrgent(e.target.checked)}
                  />
                  <Label htmlFor="isUrgent" className="text-sm font-bold text-red-700 cursor-pointer flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" /> This request is URGENT
                  </Label>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Detailed Description</Label>
                  <Textarea 
                    id="description" 
                    placeholder="Please provide more details about your request..." 
                    className="min-h-[100px]"
                    required
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Supporting Document / Proof of Payment</Label>
                  <div className="flex items-center justify-center w-full">
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-200 rounded-lg cursor-pointer bg-slate-50 hover:bg-slate-100 transition-colors">
                      {previewImage ? (
                        <img src={previewImage} alt="Preview" className="h-full w-full object-contain p-2" />
                      ) : (
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <ImageIcon className="w-8 h-8 mb-3 text-slate-400" />
                          <p className="mb-2 text-sm text-slate-500">Click to upload image</p>
                          <p className="text-xs text-slate-400">PNG, JPG or JPEG</p>
                        </div>
                      )}
                      <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} required />
                    </label>
                  </div>
                </div>

                <Button type="submit" className="w-full bg-primary hover:bg-primary/90" disabled={isSubmitting}>
                  {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <CheckCircle2 className="h-4 w-4 mr-2" />}
                  Submit Request
                </Button>
              </form>
            </Tabs>
          </DialogContent>
        </Dialog>
      </div>

      <div className="max-w-4xl mx-auto">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" /> Active Service Requests
            </h2>
          </div>

          {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : tickets.length === 0 ? (
            <Card className="border-dashed border-2 bg-slate-50/50">
              <CardContent className="flex flex-col items-center justify-center py-16">
                <FileText className="h-12 w-12 text-slate-300 mb-4" />
                <p className="text-slate-500 font-medium">No active service requests found.</p>
                <p className="text-slate-400 text-sm">Submit a new request to get started.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-4 mb-8">
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="pending">Pending</TabsTrigger>
                  <TabsTrigger value="dispatched">Dispatched</TabsTrigger>
                  <TabsTrigger value="resolved">Resolved</TabsTrigger>
                </TabsList>

                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="space-y-6">
                      {tickets
                        .filter(t => activeTab === 'all' || t.status === activeTab)
                        .map((ticket) => (
                          <motion.div
                            key={ticket.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                          >
                            <Card className="overflow-hidden border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                              <CardHeader className="bg-slate-50/50 border-b pb-4">
                                <div className="flex justify-between items-start">
                                  <div className="flex items-center gap-3">
                                    <div className={cn(
                                      "p-2 rounded-lg",
                                      ticket.type === 'billing' ? "bg-blue-100 text-blue-600" : "bg-orange-100 text-orange-600"
                                    )}>
                                      {ticket.type === 'billing' ? <FileText className="h-5 w-5" /> : <Zap className="h-5 w-5" />}
                                    </div>
                                    <div>
                                      <CardTitle className="text-lg flex items-center gap-2">
                                        {ticket.category}
                                        {ticket.isUrgent === 1 && (
                                          <Badge variant="destructive" className="text-[10px] animate-pulse">URGENT</Badge>
                                        )}
                                      </CardTitle>
                                      <CardDescription>Ticket ID: {ticket.id.substring(0, 8).toUpperCase()}</CardDescription>
                                    </div>
                                  </div>
                                  <Badge variant={ticket.status === 'resolved' ? 'default' : 'secondary'} className={cn(
                                    "capitalize",
                                    ticket.status === 'pending' && "bg-yellow-100 text-yellow-700 hover:bg-yellow-100",
                                    ticket.status === 'reviewing' && "bg-blue-100 text-blue-700 hover:bg-blue-100",
                                    ticket.status === 'dispatched' && "bg-purple-100 text-purple-700 hover:bg-purple-100",
                                    ticket.status === 'resolved' && "bg-green-100 text-green-700 hover:bg-green-100"
                                  )}>
                                    {ticket.status}
                                  </Badge>
                                </div>
                              </CardHeader>
                              <CardContent className="pt-6">
                                <div className="mb-6">
                                  <p className="text-sm text-slate-600 line-clamp-2 mb-4">{ticket.description}</p>
                                  <ServiceTracker status={ticket.status} />
                                </div>
                              </CardContent>
                              <CardFooter className="bg-slate-50/30 border-t py-3 flex justify-between">
                                <span className="text-xs text-slate-400">
                                  Submitted on {ticket.createdAt ? new Date(ticket.createdAt).toLocaleDateString() : 'Just now...'}
                                </span>
                                <Link to={`/ticket/${ticket.id}`}>
                                  <Button variant="ghost" size="sm" className="gap-2 text-primary hover:text-primary hover:bg-primary/5">
                                    <MessageSquare className="h-4 w-4" /> View Details & Chat
                                  </Button>
                                </Link>
                              </CardFooter>
                            </Card>
                          </motion.div>
                        ))}
                      
                      {tickets.filter(t => activeTab === 'all' || t.status === activeTab).length === 0 && (
                        <Card className="border-dashed border-2 bg-slate-50/50">
                          <CardContent className="flex flex-col items-center justify-center py-16">
                            <FileText className="h-12 w-12 text-slate-300 mb-4" />
                            <p className="text-slate-500 font-medium">No {activeTab} requests found.</p>
                          </CardContent>
                        </Card>
                      )}
                    </div>
                  </motion.div>
                </AnimatePresence>
              </Tabs>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
