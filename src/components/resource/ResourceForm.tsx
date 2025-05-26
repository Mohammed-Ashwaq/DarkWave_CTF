import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type ResourceFormValues = {
  title: string;
  description: string;
  content: string;
  external_link: string;
  file_url: string;
  category: "tutorial" | "tool" | "reference" | "other";
  is_compressed: boolean;
};

interface ResourceFormProps {
  existingResource?: ResourceFormValues & { id?: string };
  onSuccess?: () => void;
  defaultCategory?: "Walk Through" | "Blog" | "reference" | "other";
  initialContent?: string;
  showScreenshotTip?: boolean;
  isBlogMode?: boolean;
}


const MAX_CONTENT_SIZE = 1048576; // 1MB
const CATEGORIES = [
  { value: "tutorial", label: "Tutorial" },
  { value: "tool", label: "Tool" },
  { value: "reference", label: "Reference" },
  { value: "other", label: "Other Resources" },
];

export default function ResourceForm({ existingResource, onSuccess }: ResourceFormProps) {
  const [user, setUser] = React.useState<any>(null);
  const [authLoading, setAuthLoading] = React.useState(true);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    reset,
    setError,
    setValue,
    formState: { isSubmitting, errors },
  } = useForm<ResourceFormValues>({
    defaultValues: existingResource || {
      title: '',
      description: '',
      content: '',
      external_link: '',
      file_url: '',
      category: 'tutorial',
      is_compressed: false
    }
  });

  useEffect(() => {
    let unsub: any = null;
    async function checkAuth() {
      const { data } = await supabase.auth.getSession();
      setUser(data.session?.user ?? null);
      setAuthLoading(false);
    }
    checkAuth();
    unsub = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      setAuthLoading(false);
    });
    return () => typeof unsub?.unsubscribe === "function" && unsub.unsubscribe();
  }, []);

  const onSubmit = async (data: ResourceFormValues) => {
    try {
      if (typeof data.content === "string") {
        const contentSize = new Blob([data.content]).size;
        if (contentSize > MAX_CONTENT_SIZE) {
          setError("content", {
            type: "manual",
            message: "Content too large! Please use file upload for documents larger than 1MB.",
          });
          toast({
            title: "Content too large",
            description: "Please use the file upload for large content",
            variant: "destructive",
          });
          return;
        }
      }

      const loadingToast = toast({
        title: "Submitting...",
        description: "Please wait while your resource is saved.",
      });

      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        toast({
          title: "Not authenticated",
          description: "Please log in before submitting",
          variant: "destructive",
        });
        return;
      }

      let error;
      if (existingResource?.id) {
        // Update existing resource
        ({ error } = await supabase
          .from("resources")
          .update({
            ...data,
            updated_at: new Date().toISOString()
          })
          .eq("id", existingResource.id));
      } else {
        // Create new resource
        ({ error } = await supabase.from("resources").insert({
          ...data,
          created_by: user.id,
        }));
      }

      if (error) {
        toast({
          title: "Failed to save resource",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      toast({
        title: existingResource?.id ? "Resource updated!" : "Resource submitted!",
        description: `Your resource "${data.title}" was ${existingResource?.id ? 'updated' : 'saved'}`,
      });

      reset();
      onSuccess?.();
    } catch (err: any) {
      toast({
        title: "Unexpected error",
        description: err?.message || "Unknown error",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="bg-gray-900 min-h-screen p-6">
      {authLoading ? (
        <div className="w-full text-center py-8">
          <span className="text-gray-400 text-sm">Checking authentication...</span>
        </div>
      ) : !user ? (
        <div className="w-full text-center py-8">
          <p className="text-sm text-gray-400 mb-3">
            You must <a href="/auth" className="underline text-blue-400">login</a> to publish.
          </p>
        </div>
      ) : (
        <form
          className="bg-gray-800 text-gray-100 shadow-lg rounded-xl p-6 max-w-2xl w-full mx-auto flex flex-col gap-6 border border-gray-700"
          onSubmit={handleSubmit(onSubmit)}
        >
          {/* Title */}
          <div>
            <label htmlFor="title" className="font-medium block mb-2 text-gray-300">Title</label>
            <Input
              id="title"
              className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500"
              {...register("title", { required: "Title is required" })}
              placeholder="Title"
              disabled={isSubmitting}
              maxLength={255}
            />
            {errors.title && (
              <p className="text-xs text-red-400 font-medium mt-1">{errors.title.message}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="font-medium block mb-2 text-gray-300">Description</label>
            <Textarea
              id="description"
              className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500"
              {...register("description", { required: "Description is required" })}
              placeholder="Short description"
              rows={2}
              maxLength={500}
              disabled={isSubmitting}
            />
            {errors.description && (
              <p className="text-xs text-red-400 font-medium mt-1">{errors.description.message}</p>
            )}
          </div>

          {/* Category */}
          <div>
            <label htmlFor="category" className="font-medium block mb-2 text-gray-300">Category</label>
            <Select
              {...register("category", { required: "Category is required" })}
              onValueChange={(value) => {
                setValue("category", value as ResourceFormValues["category"]);
              }}
            >
              <SelectTrigger className="w-[180px] bg-gray-700 text-white border-gray-600 hover:bg-gray-600">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent className="bg-gray-700 border-gray-600 text-white">
                {CATEGORIES.map((category) => (
                  <SelectItem 
                    key={category.value} 
                    value={category.value}
                    className="hover:bg-gray-600 focus:bg-gray-600"
                  >
                    {category.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.category && (
              <p className="text-xs text-red-400 font-medium mt-1">{errors.category.message}</p>
            )}
          </div>

          {/* Content */}
          <div>
            <label htmlFor="content" className="font-medium block mb-2 text-gray-300">
              Content
              <span className="ml-2 text-xs text-gray-400">(Max 1MB. Use file upload above this.)</span>
            </label>
            <Textarea
              id="content"
              className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500"
              {...register("content")}
              placeholder="Full content"
              rows={8}
              disabled={isSubmitting}
            />
            {errors.content && (
              <p className="text-xs text-red-400 font-medium mt-1">{errors.content.message}</p>
            )}
          </div>

          {/* External Link */}
          <div>
            <label htmlFor="external_link" className="font-medium block mb-2 text-gray-300">External Link</label>
            <Input
              id="external_link"
              className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500"
              {...register("external_link")}
              placeholder="https://example.com"
              type="url"
              disabled={isSubmitting}
            />
          </div>

          {/* File URL */}
          <div>
            <label htmlFor="file_url" className="font-medium block mb-2 text-gray-300">File URL</label>
            <Input
              id="file_url"
              className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500"
              {...register("file_url")}
              placeholder="File location..."
              disabled={isSubmitting}
            />
          </div>

          {/* is_compressed */}
          <div className="flex items-center gap-3">
            <Checkbox
              id="is_compressed"
              className="border-gray-500 data-[state=checked]:bg-blue-500"
              {...register("is_compressed")}
              disabled={isSubmitting}
            />
            <label htmlFor="is_compressed" className="select-none text-sm text-gray-300">
              Compressed file?
            </label>
          </div>

          {/* Submit Button */}
          <div className="sticky bottom-0 bg-gray-800 pb-1 pt-2 z-10 -mx-6 px-6 border-t border-gray-700 md:relative md:bg-transparent md:m-0 md:p-0 md:border-0 flex">
            <Button
              type="submit"
              className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Saving..." : existingResource?.id ? "Update Resource" : "Save Resource"}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}