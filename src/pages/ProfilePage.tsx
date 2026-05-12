import React, { useState } from 'react';
import { useAuth } from '@/src/context/AuthContext';
import { api } from '@/src/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from 'sonner';
import { User, Mail, Shield, Save, Loader2, Phone, MapPin, Camera } from 'lucide-react';
import { cn } from '@/lib/utils';

export const ProfilePage: React.FC = () => {
  const { user, userData } = useAuth();
  const [fullName, setFullName] = useState(userData?.fullName || '');
  const [accountNumber, setAccountNumber] = useState(userData?.accountNumber || '');
  const [phoneNumber, setPhoneNumber] = useState(userData?.phoneNumber || '');
  const [address, setAddress] = useState(userData?.address || '');
  const [profileImage, setProfileImage] = useState(userData?.profileImage || '');
  const [loading, setLoading] = useState(false);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      await api.auth.updateProfile({ 
        fullName,
        phoneNumber,
        address,
        profileImage,
        accountNumber
      });
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-2xl">
      <Card className="border-slate-100 shadow-xl overflow-hidden">
        <div className="h-32 bg-primary/10 relative">
          <div className="absolute -bottom-12 left-8">
            <div className="relative group">
              <Avatar className="h-24 w-24 border-4 border-white shadow-lg">
                <AvatarImage src={profileImage || `https://api.dicebear.com/7.x/initials/svg?seed=${userData?.fullName}`} />
                <AvatarFallback>{userData?.fullName?.charAt(0)}</AvatarFallback>
              </Avatar>
              <label className="absolute inset-0 flex items-center justify-center bg-black/40 text-white rounded-full opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
                <Camera className="h-6 w-6" />
                <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
              </label>
            </div>
          </div>
        </div>
        
        <CardHeader className="pt-16 pb-4">
          <CardTitle className="text-2xl font-bold">{userData?.fullName}</CardTitle>
          <CardDescription className="flex items-center gap-2">
            <Shield className="h-3 w-3" /> {userData?.role?.toUpperCase()} ACCOUNT
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleUpdate}>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fullName" className="text-slate-500">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <Input 
                    id="fullName" 
                    value={fullName} 
                    onChange={(e) => setFullName(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-slate-500">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <Input 
                    value={userData?.email} 
                    disabled 
                    className="pl-10 bg-slate-50 border-slate-100 text-slate-500"
                  />
                </div>
                <p className="text-[10px] text-slate-400 italic">Email cannot be changed online for security reasons.</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="accountNumber" className="text-slate-500">Utility Account Number</Label>
                <Input 
                  id="accountNumber"
                  value={accountNumber} 
                  onChange={(e) => setAccountNumber(e.target.value)}
                  className={cn(
                    "font-mono",
                    userData?.accountNumber === 'PENDING' ? "border-primary/50 bg-primary/5" : ""
                  )}
                />
                {userData?.accountNumber === 'PENDING' && (
                  <p className="text-[10px] text-primary font-medium">Please enter your 10-digit SORECO-1 account number.</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phoneNumber" className="text-slate-500">Phone Number</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                    <Input 
                      id="phoneNumber" 
                      value={phoneNumber} 
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="09XX XXX XXXX"
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address" className="text-slate-500">Service Address</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                    <Input 
                      id="address" 
                      value={address} 
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="Barangay, Municipality"
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="bg-slate-50/50 border-t p-6">
            <Button type="submit" className="bg-primary hover:bg-primary/90 text-white gap-2" disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Save Changes
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};
