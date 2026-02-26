import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Wand2, Image, Copy, Download, Loader2, Upload, Trash2, ImagePlus } from "lucide-react";
import { toast } from "sonner";

const Publicite = () => {
  const navigate = useNavigate();
  const [topic, setTopic] = useState("");
  const [tone, setTone] = useState("professionnel");
  const [generatedText, setGeneratedText] = useState("");
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [loadingText, setLoadingText] = useState(false);
  const [loadingImage, setLoadingImage] = useState(false);
  const [photos, setPhotos] = useState<{ name: string; url: string }[]>([]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchPhotos = async () => {
    const { data } = await supabase.storage.from("marketing-photos").list("", { sortBy: { column: "created_at", order: "desc" } });
    if (data) {
      const items = data.map((f) => ({
        name: f.name,
        url: supabase.storage.from("marketing-photos").getPublicUrl(f.name).data.publicUrl,
      }));
      setPhotos(items);
    }
  };

  useEffect(() => { fetchPhotos(); }, []);

  const uploadPhotos = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        const ext = file.name.split(".").pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
        const { error } = await supabase.storage.from("marketing-photos").upload(fileName, file);
        if (error) { toast.error(`Erreur: ${file.name}`); console.error(error); }
      }
      toast.success(`${files.length} photo(s) ajoutée(s)`);
      fetchPhotos();
    } catch (e) {
      toast.error("Erreur lors de l'upload");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const deletePhoto = async (name: string) => {
    await supabase.storage.from("marketing-photos").remove([name]);
    toast.success("Photo supprimée");
    fetchPhotos();
  };

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
      const { data: promptData, error: promptError } = await supabase.functions.invoke("generate-marketing", {
        body: { type: "image_prompt", topic },
      });
      if (promptError) throw promptError;
      const imagePrompt = promptData?.content || topic;

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

      <div className="max-w-3xl mx-auto p-4 sm:p-8">
        <Tabs defaultValue="generate" className="space-y-6">
          <TabsList className="w-full">
            <TabsTrigger value="generate" className="flex-1 gap-1"><Wand2 className="h-3 w-3" /> Générer</TabsTrigger>
            <TabsTrigger value="photos" className="flex-1 gap-1"><ImagePlus className="h-3 w-3" /> Mes photos</TabsTrigger>
          </TabsList>

          {/* TAB: Générer */}
          <TabsContent value="generate" className="space-y-6">
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

            {generatedText && (
              <div className="border border-border rounded-lg p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-primary uppercase tracking-wider">Texte généré</h3>
                  <Button size="sm" variant="outline" onClick={copyText} className="gap-1">
                    <Copy className="h-3 w-3" /> Copier
                  </Button>
                </div>
                <div className="bg-secondary/50 rounded-lg p-4 text-sm whitespace-pre-wrap text-foreground">
                  {generatedText}
                </div>
              </div>
            )}

            {generatedImage && (
              <div className="border border-border rounded-lg p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-primary uppercase tracking-wider">Image générée</h3>
                  <Button size="sm" variant="outline" onClick={downloadImage} className="gap-1">
                    <Download className="h-3 w-3" /> Télécharger
                  </Button>
                </div>
                <img src={generatedImage} alt="Publicité générée" className="w-full rounded-lg" />
              </div>
            )}

            {loadingText && (
              <div className="border border-border rounded-lg p-8 flex items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-primary mr-2" />
                <span className="text-sm text-muted-foreground">Génération du texte en cours...</span>
              </div>
            )}
            {loadingImage && (
              <div className="border border-border rounded-lg p-8 flex items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-primary mr-2" />
                <span className="text-sm text-muted-foreground">Génération de l'image en cours...</span>
              </div>
            )}
          </TabsContent>

          {/* TAB: Mes photos */}
          <TabsContent value="photos" className="space-y-4">
            <div className="border border-border rounded-lg p-5 space-y-4">
              <h3 className="text-sm font-semibold text-primary uppercase tracking-wider">
                Ma banque de photos
              </h3>
              <p className="text-xs text-muted-foreground">
                Ajoute tes propres photos pour tes publicités Facebook, Instagram ou flyers.
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => uploadPhotos(e.target.files)}
              />
              <Button onClick={() => fileInputRef.current?.click()} disabled={uploading} className="gap-1">
                {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                {uploading ? "Upload en cours..." : "Ajouter des photos"}
              </Button>
            </div>

            {photos.length === 0 ? (
              <div className="text-center py-12">
                <ImagePlus className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground text-sm">Aucune photo ajoutée</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {photos.map((photo) => (
                  <div key={photo.name} className="relative group rounded-lg overflow-hidden border border-border">
                    <img src={photo.url} alt={photo.name} className="w-full aspect-square object-cover" />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-end justify-center opacity-0 group-hover:opacity-100">
                      <div className="flex gap-1 p-2">
                        <Button
                          size="sm"
                          variant="secondary"
                          className="h-7 text-xs gap-1"
                          onClick={() => {
                            navigator.clipboard.writeText(photo.url);
                            toast.success("Lien copié!");
                          }}
                        >
                          <Copy className="h-3 w-3" /> Lien
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          className="h-7 text-xs gap-1"
                          onClick={() => deletePhoto(photo.name)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Publicite;
