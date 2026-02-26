import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { type, topic, tone } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const companyContext = `
Tu es un expert en marketing pour "Les Entreprises E.M.J", une entreprise d'entretien paysager et services extérieurs au Québec.
Propriétaire: Maxime Jutras
Services: Tonte de pelouse, taille de haies, élagage, terreautage, aération du sol, nettoyage de gouttières, ramassage de feuilles, entretien de plates-bandes, nettoyage de stationnements et pavés, déneigement, ouverture/fermeture de terrain.
Téléphone: 819-293-7675
Courriel: lesentreprisesemj@gmail.com
`;

    let systemPrompt = companyContext;
    
    if (type === "text") {
      systemPrompt += `\nGénère un texte publicitaire ${tone || "professionnel"} en français québécois pour les réseaux sociaux ou flyer.
Le texte doit être accrocheur, inclure un appel à l'action avec le numéro de téléphone.
Sujet demandé: ${topic || "promotion générale des services"}
Format: Retourne UNIQUEMENT le texte publicitaire, prêt à copier-coller. Inclus des emojis pertinents.`;
    } else if (type === "image_prompt") {
      systemPrompt += `\nGénère un prompt en anglais optimisé pour la génération d'image AI.
Le prompt doit décrire une image professionnelle pour une publicité d'entretien paysager.
Sujet demandé: ${topic || "entretien paysager professionnel"}
Format: Retourne UNIQUEMENT le prompt en anglais, sans explication.`;
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: topic || "Crée une publicité pour mes services d'entretien paysager" },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Trop de requêtes, réessayez dans un moment." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Crédits IA épuisés." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI error:", response.status, t);
      throw new Error("Erreur AI gateway");
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";

    return new Response(JSON.stringify({ content }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-marketing error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Erreur inconnue" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
