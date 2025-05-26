
import React, { useState } from 'react';
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const loginSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" })
});

const signupSchema = z.object({
  username: z.string().min(3, { message: "Username must be at least 3 characters" }),
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
  confirmPassword: z.string()
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"]
});

const Auth = () => {
  const { signIn, signUp, user } = useAuth();
  const [activeTab, setActiveTab] = useState<string>("login");
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);

  const loginForm = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: ""
    }
  });

  const signupForm = useForm<z.infer<typeof signupSchema>>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      confirmPassword: ""
    }
  });

  const onLoginSubmit = async (values: z.infer<typeof loginSchema>) => {
    await signIn(values.email, values.password);
  };

  const checkUsernameUniqueness = async (username: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('username')
        .eq('username', username)
        .single();
      
      return !data; // Return true if username is unique (no data found)
    } catch (error) {
      return true; // If there's an error (like no record found), username is unique
    }
  };

  const onSignupSubmit = async (values: z.infer<typeof signupSchema>) => {
    setIsCheckingUsername(true);
    
    try {
      // Check if username is already taken
      const isUsernameUnique = await checkUsernameUniqueness(values.username);
      
      if (!isUsernameUnique) {
        toast.error('Username already taken', { 
          description: 'Please choose a different username'
        });
        setIsCheckingUsername(false);
        return;
      }
      
      // Proceed with signup if username is unique
      await signUp(values.email, values.password, values.username);
      
      // Reset the form after submission
      signupForm.reset();
      
      // Switch to login tab after successful signup
      setActiveTab("login");
    } catch (error) {
      console.error('Error during signup:', error);
    } finally {
      setIsCheckingUsername(false);
    }
  };

  if (user) {
    return <Navigate to="/challenges" replace />;
  }

  return (
    <div className="bg-cyber-black min-h-screen">
      <Navbar />
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto">
          <Card className="cyber-border bg-cyber-darkgray/80 p-6">
            <h1 className="text-2xl font-bold mb-6 neon-text text-center">ACCESS TERMINAL</h1>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2 mb-8">
                <TabsTrigger value="login" className="data-[state=active]:bg-cyber-blue data-[state=active]:text-black">Login</TabsTrigger>
                <TabsTrigger value="signup" className="data-[state=active]:bg-cyber-blue data-[state=active]:text-black">Signup</TabsTrigger>
              </TabsList>

              <TabsContent value="login">
                <Form {...loginForm}>
                  <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-6">
                    <FormField
                      control={loginForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-300">Email</FormLabel>
                          <FormControl>
                            <Input placeholder="your@email.com" {...field} className="bg-cyber-black border-cyber-blue text-white" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={loginForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-300">Password</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="••••••••" {...field} className="bg-cyber-black border-cyber-blue text-white" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="submit" className="cyber-button w-full">
                      Login
                    </Button>
                  </form>
                </Form>
              </TabsContent>

              <TabsContent value="signup">
                <Form {...signupForm}>
                  <form onSubmit={signupForm.handleSubmit(onSignupSubmit)} className="space-y-4">
                    <FormField
                      control={signupForm.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-300">Username</FormLabel>
                          <FormControl>
                            <Input placeholder="cyberninja" {...field} className="bg-cyber-black border-cyber-blue text-white" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={signupForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-300">Email</FormLabel>
                          <FormControl>
                            <Input placeholder="your@email.com" {...field} className="bg-cyber-black border-cyber-blue text-white" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={signupForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-300">Password</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="••••••••" {...field} className="bg-cyber-black border-cyber-blue text-white" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={signupForm.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-300">Confirm Password</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="••••••••" {...field} className="bg-cyber-black border-cyber-blue text-white" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="submit" disabled={isCheckingUsername} className="cyber-button w-full">
                      {isCheckingUsername ? 'Checking...' : 'Sign Up'}
                    </Button>
                  </form>
                </Form>
              </TabsContent>
            </Tabs>
          </Card>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Auth;
