// Redesigned Profile Page
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Trophy, Award, Shield, Check, Save, Lock } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

const profileDisplaySchema = z.object({ display_name: z.string().min(2).max(50).optional() });
const profileBioSchema = z.object({ bio: z.string().max(500).optional() });

const Profile = () => {
  const { user, profile, refreshProfile, updateProfile } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [isUpdating, setIsUpdating] = useState(false);

  const displayNameForm = useForm({
    resolver: zodResolver(profileDisplaySchema),
    defaultValues: { display_name: '' },
  });

  const bioForm = useForm({
    resolver: zodResolver(profileBioSchema),
    defaultValues: { bio: '' },
  });

  useEffect(() => {
    if (profile) {
      displayNameForm.reset({ display_name: profile.display_name || '' });
      bioForm.reset({ bio: profile.bio || '' });
    } else {
      refreshProfile(user);
    }
  }, [profile]);

  const { data: solves } = useQuery({
    queryKey: ['solves', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('solves')
        .select('*, challenges:challenge_id (title, category, points, difficulty)')
        .eq('user_id', user.id)
        .order('submitted_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
    staleTime: 600000,
    gcTime: 1800000,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
  });

  const onSubmitDisplayName = async (data) => {
    if (!user) return;
    try {
      setIsUpdating(true);
      await updateProfile({ display_name: data.display_name });
      toast.success('Display name updated!');
    } catch (error) {
      toast.error('Error updating display name', { description: error.message });
    } finally {
      setIsUpdating(false);
    }
  };

  const onSubmitBio = async (data) => {
    if (!user) return;
    try {
      setIsUpdating(true);
      await updateProfile({ bio: data.bio });
      toast.success('Bio updated!');
    } catch (error) {
      toast.error('Error updating bio', { description: error.message });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <ProtectedRoute>
      <div className="bg-cyber-black text-white min-h-screen">
        <Navbar />
        <header className="pt-24 pb-12 bg-cyber-darkgray border-b border-cyber-blue py-10">
          <div className="container mx-auto px-4">
            <h1 className="text-4xl font-bold text-cyber-yellow mb-2">Your Hacker Profile</h1>
            <p className="text-cyber-blue max-w-2xl">Manage your identity and keep track of your hacking achievements.</p>
          </div>
        </header>

        <main className="container mx-auto px-4 py-12 grid lg:grid-cols-3 gap-8">
          <aside className="bg-cyber-darkgray/90 rounded-2xl shadow-xl p-6">
            <div className="flex flex-col items-center text-center">
              <Avatar className="w-24 h-24 border border-cyber-blue">
                <AvatarFallback className="bg-cyber-blue/10 text-3xl font-bold">
                  {profile?.username?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <h2 className="mt-4 text-xl font-semibold">{profile?.display_name || profile?.username}</h2>
              <p className="text-cyber-blue text-sm">{user?.email}</p>
              <div className="mt-4 space-y-2 text-left w-full">
                <div className="flex justify-between">
                  <span>Points:</span>
                  <span className="text-cyber-green font-mono">{profile?.points || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span>Challenges Solved:</span>
                  <span>{solves?.length || 0}</span>
                </div>
                {profile?.is_admin && (
                  <Badge className="w-fit bg-cyber-purple/20 text-cyber-purple border border-cyber-purple">Admin</Badge>
                )}
              </div>
            </div>
          </aside>

          <section className="lg:col-span-2 space-y-8">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid grid-cols-2 bg-cyber-darkgray border border-cyber-blue rounded-xl overflow-hidden">
                <TabsTrigger value="profile" className="py-2 px-4 text-white">Edit Profile</TabsTrigger>
                <TabsTrigger value="solves" className="py-2 px-4 text-white">Solves</TabsTrigger>
              </TabsList>
              <TabsContent value="profile" className="pt-6">
                <Card className="p-6 mb-6 bg-cyber-darkgray/80 rounded-xl border border-cyber-blue">
                  <h3 className="text-lg font-bold text-cyber-yellow mb-4">Display Name</h3>
                  <Form {...displayNameForm}>
                    <form onSubmit={displayNameForm.handleSubmit(onSubmitDisplayName)} className="space-y-4">
                      <FormField
                        control={displayNameForm.control}
                        name="display_name"
                        render={({ field }) => (
                          <FormItem>
                            {/* <FormLabel>Display Name</FormLabel> */}
                            <FormControl>
                              <Input {...field} className="bg-cyber-black border-cyber-blue text-white" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button type="submit" disabled={isUpdating} className="cyber-button">
                        <Save className="mr-2 h-4 w-4" /> Save
                      </Button>
                    </form>
                  </Form>
                </Card>

                <Card className="p-6 bg-cyber-darkgray/80 rounded-xl border border-cyber-blue">
                  <h3 className="text-lg font-bold text-cyber-yellow mb-4">Bio</h3>
                  <Form {...bioForm}>
                    <form onSubmit={bioForm.handleSubmit(onSubmitBio)} className="space-y-4">
                      <FormField
                        control={bioForm.control}
                        name="bio"
                        render={({ field }) => (
                          <FormItem>
                            {/* <FormLabel>Bio</FormLabel> */}
                            <FormControl>
                              <Textarea {...field} className="bg-cyber-black border-cyber-blue text-white h-24 resize-none" placeholder="Tell us about your hacking journey..." />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button type="submit" disabled={isUpdating} className="cyber-button">
                        <Save className="mr-2 h-4 w-4" /> Save
                      </Button>
                    </form>
                  </Form>
                </Card>
              </TabsContent>

              <TabsContent value="solves" className="pt-6">
                <Card className="p-6 bg-cyber-darkgray/80 rounded-xl border border-cyber-blue">
                  <h3 className="text-lg font-bold text-cyber-yellow mb-4 flex items-center">
                    <Trophy className="mr-2" /> Solved Challenges
                  </h3>
                  {solves?.length > 0 ? (
                    <div className="space-y-4">
                      {solves.map((solve) => (
                        <div key={solve.id} className="border-b border-cyber-blue/20 pb-4">
                          <div className="flex justify-between">
                            <div>
                              <div className="flex items-center">
                                <Check className="text-cyber-green h-4 w-4 mr-2" />
                                <span className="text-white font-medium">{solve.challenges.title}</span>
                              </div>
                              <div className="flex space-x-2 mt-2">
                                <Badge className="bg-cyber-darkgray border-cyber-blue text-cyber-blue">
                                  {solve.challenges.category}
                                </Badge>
                                <Badge className={`text-white border ${
                                  solve.challenges.difficulty === 'easy' ? 'bg-green-700/30 border-green-500' :
                                  solve.challenges.difficulty === 'medium' ? 'bg-yellow-700/30 border-yellow-500' :
                                  'bg-red-700/30 border-red-500'
                                }`}>
                                  {solve.challenges.difficulty.charAt(0).toUpperCase() + solve.challenges.difficulty.slice(1)}
                                </Badge>
                              </div>
                            </div>
                            <div className="text-right text-sm">
                              <div className="text-cyber-yellow font-mono">{solve.challenges.points} pts</div>
                              <div className="text-gray-400">{new Date(solve.submitted_at).toLocaleString()}</div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-10 text-gray-400">
                      <Award className="mx-auto h-10 w-10 mb-2" />
                      <p>You haven’t solved any challenges yet.</p>
                    </div>
                  )}
                </Card>
              </TabsContent>
            </Tabs>
          </section>
        </main>

        <Footer />
      </div>
    </ProtectedRoute>
  );
};

export default Profile;
