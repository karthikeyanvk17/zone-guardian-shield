
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from './AuthContext';
import { Shield, User, Lock, Loader2 } from 'lucide-react';

const LoginForm: React.FC = () => {
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("user"); // "user" or "admin"
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      await login(
        formData.email, 
        formData.password, 
        activeTab === "admin"
      );
    } catch (error) {
      console.error("Login failed:", error);
      // Error is displayed by the AuthContext
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto shadow-lg animate-fade-in">
      <CardHeader className="space-y-2 text-center">
        <div className="flex justify-center mb-2">
          <div className="rounded-full bg-primary/10 p-3">
            <Shield className="h-10 w-10 text-primary animate-pulse-shield" />
          </div>
        </div>
        <CardTitle className="text-2xl font-bold gradient-text">CaptureShield</CardTitle>
        <CardDescription>
          Secure camera management in restricted areas
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="user" className="flex items-center gap-2">
              <User className="h-4 w-4" /> User
            </TabsTrigger>
            <TabsTrigger value="admin" className="flex items-center gap-2">
              <Lock className="h-4 w-4" /> Admin
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="user">
            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="user-email">Email</Label>
                <Input 
                  id="user-email" 
                  name="email" 
                  type="email" 
                  placeholder="user@example.com"
                  value={formData.email}
                  onChange={handleInputChange}
                  autoComplete="email"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="user-password">Password</Label>
                <Input 
                  id="user-password" 
                  name="password" 
                  type="password"
                  value={formData.password} 
                  onChange={handleInputChange}
                  autoComplete="current-password"
                  required
                />
              </div>
              <Button 
                type="submit" 
                className="w-full" 
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Logging in...
                  </>
                ) : "Login as User"}
              </Button>
              
              <div className="text-center text-sm text-muted-foreground">
                <p>Demo credentials:</p>
                <p>Email: user@captureshield.com</p>
                <p>Password: user123</p>
              </div>
            </form>
          </TabsContent>
          
          <TabsContent value="admin">
            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="admin-email">Admin Email</Label>
                <Input 
                  id="admin-email" 
                  name="email" 
                  type="email" 
                  placeholder="admin@example.com"
                  value={formData.email}
                  onChange={handleInputChange}
                  autoComplete="email"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="admin-password">Password</Label>
                <Input 
                  id="admin-password" 
                  name="password" 
                  type="password"
                  value={formData.password} 
                  onChange={handleInputChange}
                  autoComplete="current-password"
                  required
                />
              </div>
              <Button 
                type="submit" 
                className="w-full gradient-bg"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Logging in...
                  </>
                ) : "Login as Admin"}
              </Button>
              
              <div className="text-center text-sm text-muted-foreground">
                <p>Demo credentials:</p>
                <p>Email: admin@captureshield.com</p>
                <p>Password: admin123</p>
              </div>
            </form>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default LoginForm;
