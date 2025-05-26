
import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useQuery } from '@tanstack/react-query';
import { Shield, Trophy, Award } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';

const challengeSchema = z.object({
  title: z.string().min(3, { message: "Title must be at least 3 characters" }),
  description: z.string().min(10, { message: "Description must be at least 10 characters" }),
  category: z.string().min(1, { message: "Category is required" }),
  difficulty: z.string().min(1, { message: "Difficulty is required" }),
  points: z.coerce.number().min(1, { message: "Points must be at least 1" }),
  flag: z.string().min(3, { message: "Flag is required" }),
  hint1: z.string().optional(),
  hint2: z.string().optional(),
  hint3: z.string().optional(),
  resource1name: z.string().optional(),
  resource1url: z.string().optional(),
  resource2name: z.string().optional(),
  resource2url: z.string().optional(),
  is_active: z.boolean().default(true)
});

const Admin = () => {
  const [activeTab, setActiveTab] = useState("challenges");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof challengeSchema>>({
    resolver: zodResolver(challengeSchema),
    defaultValues: {
      title: '',
      description: '',
      category: '',
      difficulty: 'easy',
      points: 100,
      flag: '',
      hint1: '',
      hint2: '',
      hint3: '',
      resource1name: '',
      resource1url: '',
      resource2name: '',
      resource2url: '',
      is_active: true
    }
  });

  const { data: challenges, refetch: refetchChallenges, isLoading: challengesLoading } = useQuery({
    queryKey: ['admin-challenges'],
    queryFn: async () => {
      console.log("Fetching challenges for admin");
      const { data, error } = await supabase
        .from('challenges')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error("Error fetching challenges:", error);
        throw error;
      }
      console.log("Fetched challenges:", data);
      return data || [];
    }
  });

  const { data: users, refetch: refetchUsers, isLoading: usersLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => {
      console.log("Fetching users for admin");
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('points', { ascending: false });
      
      if (error) {
        console.error("Error fetching users:", error);
        throw error;
      }
      console.log("Fetched users:", data);
      return data || [];
    }
  });

  const onSubmit = async (data: z.infer<typeof challengeSchema>) => {
    try {
      setIsSubmitting(true);
      // Prepare hints array
      const hints = [];
      if (data.hint1) hints.push(data.hint1);
      if (data.hint2) hints.push(data.hint2);
      if (data.hint3) hints.push(data.hint3);
      
      // Prepare resources array
      const resources = [];
      if (data.resource1name && data.resource1url) {
        resources.push({ name: data.resource1name, url: data.resource1url });
      }
      if (data.resource2name && data.resource2url) {
        resources.push({ name: data.resource2name, url: data.resource2url });
      }
      
      console.log("Creating challenge with data:", {
        ...data,
        hints: hints.length > 0 ? JSON.stringify(hints) : null,
        resources: resources.length > 0 ? JSON.stringify(resources) : null
      });
      
      // Convert arrays to JSON strings to match the expected types in Supabase
      const { error } = await supabase
        .from('challenges')
        .insert({
          title: data.title,
          description: data.description,
          category: data.category,
          difficulty: data.difficulty,
          points: data.points,
          flag: data.flag,
          hints: hints.length > 0 ? JSON.stringify(hints) : null,
          resources: resources.length > 0 ? JSON.stringify(resources) : null,
          is_active: data.is_active
        });
      
      if (error) throw error;
      
      toast.success('Challenge created successfully!');
      form.reset();
      refetchChallenges();
    } catch (error: any) {
      console.error("Error creating challenge:", error);
      toast.error('Error creating challenge', {
        description: error.message
      });
    } finally {
      setIsSubmitting(false);
    }
  };

 const toggleUserAdmin = async (userId: string, currentStatus: boolean) => {
  try {
    console.log(`Updating admin status for user ${userId}`);

    const { data, error } = await supabase
      .from('profiles')
      .update({ is_admin: !currentStatus })
      .eq('id', userId)
      .select(); // <-- this will return updated rows, helpful for debugging

    if (error) {
      console.error("Error updating admin status:", error);
      toast.error("Error updating admin status");
      return;
    }

    console.log("Updated user data:", data);

    if (!data || data.length === 0) {
      toast.error("No user updated. Check if userId is correct.");
      return;
    }

    toast.success(`Admin status ${!currentStatus ? "granted" : "revoked"} successfully!`);
    refetchUsers();
  } catch (error: any) {
    console.error("Caught error:", error.message);
    toast.error("Unexpected error", {
      description: error.message,
    });
  }
};

  const toggleChallengeStatus = async (challengeId: string, currentStatus: boolean) => {
    try {
      console.log(`Updating challenge status for ${challengeId} from ${currentStatus} to ${!currentStatus}`);
      
      const { error } = await supabase
        .from('challenges')
        .update({ is_active: !currentStatus })
        .eq('id', challengeId);
      
      if (error) {
        console.error("Error updating challenge status:", error);
        throw error;
      }
      
      toast.success(`Challenge ${!currentStatus ? 'activated' : 'deactivated'} successfully!`);
      refetchChallenges();
    } catch (error: any) {
      console.error("Error toggling challenge status:", error);
      toast.error('Error updating challenge status', {
        description: error.message
      });
    }
  };

  return (
    <ProtectedRoute adminOnly>
      <div className="bg-cyber-black min-h-screen">
        <Navbar />
        <div className="pg-20 pt-20 bg-cyber-darkgray border-b border-cyber-blue">
          <div className="container mx-auto px-4">
            <div className="flex items-center">
              <Shield className="text-cyber-purple h-8 w-8 mr-3" />
              <h1 className="text-4xl font-bold neon-text">ADMIN PANEL</h1>
            </div>
            <p className="text-gray-300 max-w-3xl mt-2">
              Manage challenges, users, and view CTF statistics.
            </p>
          </div>
        </div>
        
        <div className="container mx-auto px-4 py-12">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-8">
              <TabsTrigger value="challenges" className="data-[state=active]:bg-cyber-blue data-[state=active]:text-black">
                Challenges
              </TabsTrigger>
              <TabsTrigger value="users" className="data-[state=active]:bg-cyber-blue data-[state=active]:text-black">
                Users
              </TabsTrigger>
              <TabsTrigger value="create" className="data-[state=active]:bg-cyber-blue data-[state=active]:text-black">
                Create Challenge
              </TabsTrigger>
            </TabsList>
            
            {/* Challenges Tab */}
            <TabsContent value="challenges">
              <Card className="cyber-border bg-cyber-darkgray/80 p-6">
                <h2 className="text-xl font-bold mb-6 flex items-center">
                  <Trophy className="mr-2 text-cyber-yellow" /> 
                  <span className="text-blue-500"> Challenge Management </span>
                </h2>
                
                <div className="overflow-x-auto">
                  {challengesLoading ? (
                    <div className="text-center p-8 text-cyber-blue">Loading challenges...</div>
                  ) : challenges && challenges.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow className="hover:bg-cyber-black/50 border-b border-cyber-blue">
                          <TableHead className="text-cyber-blue">Title</TableHead>
                          <TableHead className="text-cyber-blue">Category</TableHead>
                          <TableHead className="text-cyber-blue">Difficulty</TableHead>
                          <TableHead className="text-cyber-blue">Points</TableHead>
                          <TableHead className="text-cyber-blue">Status</TableHead>
                          <TableHead className="text-cyber-blue">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {challenges.map((challenge) => (
                          <TableRow key={challenge.id} className="hover:bg-cyber-black/50 border-b border-cyber-blue/20">
                            <TableCell className="text-white">{challenge.title}</TableCell>
                            <TableCell>
                              <Badge variant="outline" className="border-cyber-blue text-cyber-blue">
                                {challenge.category}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className={
                                challenge.difficulty === 'easy' ? 'bg-green-500/20 text-green-500 border-green-500' :
                                challenge.difficulty === 'medium' ? 'bg-yellow-500/20 text-yellow-500 border-yellow-500' :
                                'bg-red-500/20 text-red-500 border-red-500'
                              }>
                                {challenge.difficulty.charAt(0).toUpperCase() + challenge.difficulty.slice(1)}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-white">{challenge.points}</TableCell>
                            <TableCell>
                              <Badge className={challenge.is_active 
                                ? "bg-green-500/20 text-green-500 border-green-500" 
                                : "bg-red-500/20 text-red-500 border-red-500"
                              }>
                                {challenge.is_active ? 'Active' : 'Inactive'}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Button 
                                variant="outline" 
                                className={challenge.is_active
                                  ? "border-red-500 text-red-500 hover:bg-red-500/20"
                                  : "border-green-500 text-green-500 hover:bg-green-500/20"
                                }
                                onClick={() => toggleChallengeStatus(challenge.id, challenge.is_active)}
                              >
                                {challenge.is_active ? 'Deactivate' : 'Activate'}
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <div className="text-center p-8 text-gray-400">No challenges found</div>
                  )}
                </div>
              </Card>
            </TabsContent>
            
            {/* Users Tab */}
            <TabsContent value="users">
              <Card className="cyber-border bg-cyber-darkgray/80 p-6">
                <h2 className="text-xl font-bold mb-6 flex items-center">
                  <Award className="mr-2 text-cyber-purple" /> 
                  <span className="text-blue-500"> User Management </span>
                </h2>
                
                <div className="overflow-x-auto">
                  {usersLoading ? (
                    <div className="text-center p-8 text-cyber-blue">Loading users...</div>
                  ) : users && users.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow className="hover:bg-cyber-black/50 border-b border-cyber-blue">
                          <TableHead className="text-cyber-blue">Username</TableHead>
                          <TableHead className="text-cyber-blue">Display Name</TableHead>
                          <TableHead className="text-cyber-blue">Points</TableHead>
                          <TableHead className="text-cyber-blue">Role</TableHead>
                          <TableHead className="text-cyber-blue">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {users.map((user) => (
                          <TableRow key={user.id} className="hover:bg-cyber-black/50 border-b border-cyber-blue/20">
                            <TableCell className="text-white">{user.username}</TableCell>
                            <TableCell className="text-white">{user.display_name || '-'}</TableCell>
                            <TableCell className="text-white">{user.points}</TableCell>
                            <TableCell>
                              <Badge className={user.is_admin
                                ? "bg-cyber-purple/20 text-cyber-purple border-cyber-purple"
                                : "bg-cyber-blue/20 text-cyber-blue border-cyber-blue"
                              }>
                                {user.is_admin ? 'Admin' : 'User'}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Button 
                                variant="outline" 
                                className={user.is_admin
                                  ? "border-red-500 text-red-500 hover:bg-red-500/20"
                                  : "border-cyber-purple text-cyber-purple hover:bg-cyber-purple/20"
                                }
                                onClick={() => toggleUserAdmin(user.id, user.is_admin)}
                              >
                                {user.is_admin ? 'Remove Admin' : 'Make Admin'}
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <div className="text-center p-8 text-gray-400">No users found</div>
                  )}
                </div>
              </Card>
            </TabsContent>
            
            {/* Create Challenge Tab */}
            <TabsContent value="create">
              <Card className="cyber-border bg-cyber-darkgray/80 p-6">
              
                <h2 className="text-blue-500 text-xl font-bold mb-6">Create New Challenge</h2>
                
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="title"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-gray-300">Challenge Title</FormLabel>
                            <FormControl>
                              <Input {...field} className="bg-cyber-black border-cyber-blue text-white" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="category"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-gray-300">Category</FormLabel>
                            <FormControl>
                              <Input {...field} className="bg-cyber-black border-cyber-blue text-white" placeholder="Web, Crypto, Forensics, etc." />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="difficulty"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-gray-300">Difficulty</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger className="bg-cyber-black border-cyber-blue text-white">
                                  <SelectValue placeholder="Select difficulty" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent className="bg-cyber-black border-cyber-blue">
                                <SelectItem value="easy">Easy</SelectItem>
                                <SelectItem value="medium">Medium</SelectItem>
                                <SelectItem value="hard">Hard</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="points"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-gray-300">Points</FormLabel>
                            <FormControl>
                              <Input type="number" {...field} className="bg-cyber-black border-cyber-blue text-white" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-300">Description</FormLabel>
                          <FormControl>
                            <Textarea 
                              {...field} 
                              className="bg-cyber-black border-cyber-blue text-white resize-none h-24"
                              placeholder="Describe the challenge here..."
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="flag"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-300">Flag</FormLabel>
                          <FormControl>
                            <Input {...field} className="bg-cyber-black border-cyber-blue text-white" placeholder="flag{example_flag_format}" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    {/* Hints */}
                    <h3 className="font-semibold text-lg mt-6">Hints</h3>
                    <div className="space-y-4">
                      <FormField
                        control={form.control}
                        name="hint1"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-gray-300">Hint 1</FormLabel>
                            <FormControl>
                              <Input {...field} className="bg-cyber-black border-cyber-blue text-white" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="hint2"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-gray-300">Hint 2</FormLabel>
                            <FormControl>
                              <Input {...field} className="bg-cyber-black border-cyber-blue text-white" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="hint3"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-gray-300">Hint 3</FormLabel>
                            <FormControl>
                              <Input {...field} className="bg-cyber-black border-cyber-blue text-white" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    {/* Resources */}
                    <h3 className="font-semibold text-lg mt-6">Resources</h3>
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="resource1name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-gray-300">Resource 1 Name</FormLabel>
                              <FormControl>
                                <Input {...field} className="bg-cyber-black border-cyber-blue text-white" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="resource1url"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-gray-300">Resource 1 URL</FormLabel>
                              <FormControl>
                                <Input {...field} className="bg-cyber-black border-cyber-blue text-white" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="resource2name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-gray-300">Resource 2 Name</FormLabel>
                              <FormControl>
                                <Input {...field} className="bg-cyber-black border-cyber-blue text-white" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="resource2url"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-gray-300">Resource 2 URL</FormLabel>
                              <FormControl>
                                <Input {...field} className="bg-cyber-black border-cyber-blue text-white" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                    
                    {/* Status */}
                    <FormField
                      control={form.control}
                      name="is_active"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center space-x-3 space-y-0 mt-6">
                          <FormControl>
                            <input
                              type="checkbox"
                              checked={field.value}
                              onChange={field.onChange}
                              className="h-5 w-5 accent-cyber-blue"
                            />
                          </FormControl>
                          <FormLabel className="text-gray-300 font-normal">
                            Publish challenge (make active)
                          </FormLabel>
                        </FormItem>
                      )}
                    />
                    
                    <Button 
                      type="submit" 
                      className="cyber-button mt-6"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? 'Creating...' : 'Create Challenge'}
                    </Button>
                  </form>
                </Form>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
        
        <Footer />
      </div>
    </ProtectedRoute>
  );
};

export default Admin;
