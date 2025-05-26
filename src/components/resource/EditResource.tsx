import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useParams, useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

const EditResource = () => {
  const { resourceId } = useParams();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [resource, setResource] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    let unsub: any = null;
    async function fetchData() {
      setLoading(true);
      const { data } = await supabase.auth.getSession();
      setUser(data.session?.user ?? null);
      if (!data.session?.user) {
        setLoading(false);
        return;
      }

      if (resourceId) {
        const { data: res, error } = await supabase
          .from("resources")
          .select("*")
          .eq("id", resourceId)
          .maybeSingle();

        if (error || !res) {
          toast({
            title: "Error loading resource",
            description: error?.message ?? "Resource not found",
            variant: "destructive"
          });
          setLoading(false);
          return;
        }

        if (res.created_by !== data.session.user.id) {
          toast({
            title: "Unauthorized",
            description: "You are not allowed to edit this resource.",
            variant: "destructive"
          });
          setLoading(false);
          return;
        }

        setResource(res);
      }
      setLoading(false);
    }

    fetchData();
    unsub = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => typeof unsub?.unsubscribe === "function" && unsub.unsubscribe();
  }, [resourceId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setResource((r: any) => ({ ...r, [e.target.name]: e.target.value }));
  };

  const handleCheckbox = (e: React.ChangeEvent<HTMLInputElement>) => {
    setResource((r: any) => ({ ...r, [e.target.name]: e.target.checked }));
  };

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!resourceId) return;
    setSaving(true);
    const { error } = await supabase
      .from("resources")
      .update({
        title: resource.title,
        description: resource.description,
        content: resource.content,
        external_link: resource.external_link,
        file_url: resource.file_url,
        category: resource.category,
        is_compressed: resource.is_compressed
      })
      .eq("id", resourceId);
    setSaving(false);
    if (error) {
      toast({
        title: "Failed to update resource",
        description: error.message,
        variant: "destructive"
      });
      return;
    }
    toast({
      title: "Resource updated",
      description: "Your resource has been saved."
    });
    navigate("/creator-studio");
  }

  if (loading) return <div className="flex justify-center items-center h-80 text-center text-lg text-white">Loading...</div>;
  if (!user)
    return (
      <div className="flex justify-center py-12 text-center text-white">
        <span className="text-muted-foreground">Please <a href="/auth" className="underline text-blue-400">login</a> to Edit Resources.</span>
      </div>
    );
  if (!resource)
    return (
      <div className="flex justify-center py-12 text-center text-red-500">
        <span>Resource not found or you do not have access.</span>
      </div>
    );

  return (
    <div className="max-w-3xl mx-auto py-12 px-6 text-white bg-[#121212] rounded-lg shadow-xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Edit Resource</h1>
        <Button size="sm" className="bg-gray-700 hover:bg-gray-600" onClick={() => navigate("/creator-studio")}>
          Back
        </Button>
      </div>
      <form className="space-y-6" onSubmit={handleSave}>
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-300 mb-1">Title</label>
          <Input name="title" value={resource.title} onChange={handleChange} disabled={saving} className="bg-[#1e1e1e] border-gray-600 text-white" />
        </div>
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-1">Description</label>
          <Textarea name="description" value={resource.description || ''} onChange={handleChange} rows={2} disabled={saving} className="bg-[#1e1e1e] border-gray-600 text-white" />
        </div>
        <div>
          <label htmlFor="content" className="block text-sm font-medium text-gray-300 mb-1">Content</label>
          <Textarea name="content" value={resource.content || ''} onChange={handleChange} rows={6} disabled={saving} className="bg-[#1e1e1e] border-gray-600 text-white" />
        </div>
        <div>
          <label htmlFor="external_link" className="block text-sm font-medium text-gray-300 mb-1">External Link</label>
          <Input name="external_link" value={resource.external_link || ''} onChange={handleChange} disabled={saving} className="bg-[#1e1e1e] border-gray-600 text-white" />
        </div>
        <div>
          <label htmlFor="file_url" className="block text-sm font-medium text-gray-300 mb-1">File URL</label>
          <Input name="file_url" value={resource.file_url || ''} onChange={handleChange} disabled={saving} className="bg-[#1e1e1e] border-gray-600 text-white" />
        </div>
        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-300 mb-1">Category</label>
          <Input name="category" value={resource.category || ''} onChange={handleChange} disabled={saving} className="bg-[#1e1e1e] border-gray-600 text-white" />
        </div>
        <div className="flex items-center gap-2">
          <input id="is_compressed" name="is_compressed" type="checkbox" checked={!!resource.is_compressed} onChange={handleCheckbox} disabled={saving} className="accent-blue-500" />
          <label htmlFor="is_compressed" className="text-sm text-gray-300">Compressed file?</label>
        </div>
        <div className="pt-2">
          <Button type="submit" className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white" disabled={saving}>
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default EditResource;
