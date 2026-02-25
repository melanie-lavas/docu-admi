import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Copy, Check } from "lucide-react";
import { emailTemplates } from "@/lib/emailTemplates";
import { toast } from "sonner";

const categories = [...new Set(emailTemplates.map((t) => t.category))];

const EmailTemplatesPage = () => {
  const navigate = useNavigate();
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success("Copié dans le presse-papiers!");
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 z-10 bg-card border-b border-border px-3 sm:px-6 py-2 sm:py-3 flex items-center gap-2">
        <Button size="sm" variant="outline" onClick={() => navigate("/")} className="gap-1">
          <ArrowLeft className="h-4 w-4" /> Menu
        </Button>
        <h1 className="text-sm font-semibold text-foreground">Templates Courriel</h1>
      </div>

      <div className="max-w-4xl mx-auto p-4 sm:p-8">
        <Tabs defaultValue={categories[0]}>
          <TabsList className="flex flex-wrap h-auto gap-1 mb-6">
            {categories.map((cat) => (
              <TabsTrigger key={cat} value={cat} className="text-xs">
                {cat}
              </TabsTrigger>
            ))}
          </TabsList>

          {categories.map((cat) => (
            <TabsContent key={cat} value={cat} className="space-y-4">
              {emailTemplates
                .filter((t) => t.category === cat)
                .map((template) => (
                  <div key={template.id} className="border border-border rounded-lg p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-semibold text-foreground text-sm">{template.title}</h3>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Objet : {template.subject}
                        </p>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => copyToClipboard(template.subject, template.id + "-subject")}
                          className="gap-1 text-xs"
                        >
                          {copiedId === template.id + "-subject" ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                          Objet
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => copyToClipboard(template.body, template.id + "-body")}
                          className="gap-1 text-xs"
                        >
                          {copiedId === template.id + "-body" ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                          Corps
                        </Button>
                      </div>
                    </div>
                    <pre className="whitespace-pre-wrap text-xs text-muted-foreground bg-muted/50 rounded-lg p-4 font-sans">
                      {template.body}
                    </pre>
                  </div>
                ))}
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  );
};

export default EmailTemplatesPage;
