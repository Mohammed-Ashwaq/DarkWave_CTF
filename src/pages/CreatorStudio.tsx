import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";

type Resource = {
  id: string;
  title: string;
  description: string;
  created_at: string;
  category: string;
};

const CreatorStudio = () => {
  const [user, setUser] = useState<any>(null);
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    let unsub: any = null;
    async function fetchUserAndResources() {
      const { data } = await supabase.auth.getSession();
      setUser(data.session?.user ?? null);
      if (data.session?.user) {
        const { data: res, error } = await supabase
          .from("resources")
          .select("id,title,description,created_at,category")
          .eq("created_by", data.session.user.id)
          .order("created_at", { ascending: false });
        if (error) {
          toast({ title: "Failed to fetch resources", description: error.message, variant: "destructive" });
        } else {
          setResources(res ?? []);
        }
      }
      setLoading(false);
    }
    fetchUserAndResources();
    unsub = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });
    return () => typeof unsub?.unsubscribe === "function" && unsub.unsubscribe();
  }, []);

  async function handleDelete(resourceId: string) {
    const ok = window.confirm("Are you sure you want to delete this resource?");
    if (!ok) return;
    const { error } = await supabase.from("resources").delete().eq("id", resourceId);
    if (error) {
      toast({ title: "Delete failed", description: error.message, variant: "destructive" });
      return;
    }
    setResources(r => r.filter(res => res.id !== resourceId));
    toast({ title: "Resource deleted" });
  }

  function handleEdit(resourceId: string) {
    navigate(`/Edit-Resource/${resourceId}`);
  }

  if (loading) return <div className="p-6 text-center text-white">Loading...</div>;
  if (!user)
    return (
      <div className="p-6 text-center text-white">
        Please <a href="/auth" className="underline text-blue-400">login</a> to access Creator Studio.
      </div>
    );

  return (
    <div className="max-w-5xl mx-auto py-12 px-4 text-white bg-[#121212] rounded-lg shadow-xl">
      <h1 className="text-3xl font-bold mb-6 text-center">Creator Studio</h1>
      {resources.length === 0 ? (
        <p className="text-gray-400 text-center">You haven’t created any resources yet.</p>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {resources.map(res => (
            <div
              key={res.id}
              className="bg-[#1e1e1e] border border-gray-700 p-5 rounded-lg transition hover:shadow-lg"
            >
              <div className="mb-2">
                <h2 className="text-xl font-semibold">{res.title}</h2>
                <p className="text-sm text-gray-500">{res.category} • {new Date(res.created_at).toLocaleString()}</p>
              </div>
              <p className="text-gray-300 mb-4">{res.description}</p>
              <div className="flex gap-3">
                <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white" onClick={() => handleEdit(res.id)}>
                  Edit
                </Button>
                <Button size="sm" variant="destructive" onClick={() => handleDelete(res.id)}>
                  Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CreatorStudio;
