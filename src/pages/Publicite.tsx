import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Wand2, Image, Copy, Download, Loader2 } from "lucide-react";
import { toast } from "sonner";

const Publicite = () => {
  const navigate = useNavigate();
  const [topic, setTopic] = useState("");
  const [tone, setTone] = useState("professionnel");
  const [generatedText, setGeneratedText] = useState("");
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [loadingText, setLoadingText] = useState(false);
  const [loadingImage, setLoadingImage] = useState(false);

  const generateText = async () => {
    if (!topic.trim()) { toast.error("Entrez un sujet"); return; }
    setLoadingText(true);
    setGeneratedText("");
    try {
      const { data, error } = await supabase.functions.invoke("generate-marketing", {
        body: { type: "text", topic, tone },
      });
      if (error) throw error;
      if (data?.error) { toast.error(data.error); return; }
      setGeneratedText(data.content || "");
    } catch (e: any) {
      toast.error("Erreur lors de la génération");
      console.error(e);
    } finally {
      setLoadingText(false);
    }
  };

  const generateImage = async () => {
    if (!topic.trim()) { toast.error("Entrez un sujet"); return; }
    setLoadingImage(true);
    setGeneratedImage(null);
    try {
      // First get an optimized prompt
      const { data: promptData, error: promptError } = await supabase.functions.invoke("generate-marketing", {
        body: { type: "image_prompt", topic },
      });
      if (promptError) throw promptError;
      const imagePrompt = promptData?.content || topic;

      // Then generate the image
      const { data, error } = await supabase.functions.invoke("generate-marketing-image", {
        body: { prompt: imagePrompt },
      });
      if (error) throw error;
      if (data?.error) { toast.error(data.error); return; }
      setGeneratedImage(data.imageUrl || null);
      if (!data.imageUrl) toast.error("Aucune image générée");
    } catch (e: any) {
      toast.error("Erreur lors de la génération d'image");
      console.error(e);
    } finally {
      setLoadingImage(false);
    }
  };

  const copyText = () => {
    navigator.clipboard.writeText(generatedText);
    toast.success("Texte copié!");
  };

  const downloadImage = () => {
    if (!generatedImage) return;
    const link = document.createElement("a");
    link.href = generatedImage;
    link.download = `publicite-emj-${Date.now()}.png`;
    link.click();
    toast.success("Image téléchargée!");
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 z-10 bg-card border-b border-border px-3 sm:px-6 py-2 sm:py-3 flex items-center gap-2">
        <Button size="sm" variant="outline" onClick={() => navigate("/")} className="gap-1">
          <ArrowLeft className="h-4 w-4" /> Menu
        </Button>
        <h1 className="text-sm font-semibold text-foreground">Publicité IA — E.M.J</h1>
      </div>

      <div className="max-w-3xl mx-auto p-4 sm:p-8 space-y-6">
        {/* Input Section */}
        <div className="border border-border rounded-lg p-5 space-y-4">
          <h3 className="text-sm font-semibold text-primary uppercase tracking-wider">
            Générer du contenu publicitaire
          </h3>
          <div>
            <Label className="text-xs text-muted-foreground">Sujet / Promotion</Label>
            <Input
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Ex: Promotion printemps tonte de pelouse, Offre déneigement..."
              className="mt-1"
            />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Ton</Label>
            <Select value={tone} onValueChange={setTone}>
              <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="professionnel">Professionnel</SelectItem>
                <SelectItem value="amical">Amical / Décontracté</SelectItem>
                <SelectItem value="urgent">Urgent / Promo limitée</SelectItem>
                <SelectItem value="saisonnier">Saisonnier</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button onClick={generateText} disabled={loadingText} className="gap-1">
              {loadingText ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />}
              Générer le texte
            </Button>
            <Button onClick={generateImage} disabled={loadingImage} variant="outline" className="gap-1">
              {loadingImage ? <Loader2 className="h-4 w-4 animate-spin" /> : <Image className="h-4 w-4" />}
              Générer une image
            </Button>
          </div>
        </div>

        {/* Generated Text */}
        {generatedText && (
          <div className="border border-border rounded-lg p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-primary uppercase tracking-wider">
                Texte généré
              </h3>
              <Button size="sm" variant="outline" onClick={copyText} className="gap-1">
                <Copy className="h-3 w-3" /> Copier
              </Button>
            </div>
            <div className="bg-secondary/50 rounded-lg p-4 text-sm whitespace-pre-wrap text-foreground">
              {generatedText}
            </div>
          </div>
        )}

        {/* Generated Image */}
        {generatedImage && (
          <div className="border border-border rounded-lg p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-primary uppercase tracking-wider">
                Image générée
              </h3>
              <Button size="sm" variant="outline" onClick={downloadImage} className="gap-1">
                <Download className="h-3 w-3" /> Télécharger
              </Button>
            </div>
            <img src={generatedImage} alt="Publicité générée" className="w-full rounded-lg" />
          </div>
        )}

        {/* Loading states */}
        {loadingText && (
          <div className="border border-border rounded-lg p-8 flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-primary mr-2" />
            <span className="text-sm text-muted-foreground">Génération du texte en cours...</span>
          </div>
        )}
        {loadingImage && (
          <div className="border border-border rounded-lg p-8 flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-primary mr-2" />
            <span className="text-sm text-muted-foreground">Génération de l'image en cours (peut prendre quelques secondes)...</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default Publicite;
