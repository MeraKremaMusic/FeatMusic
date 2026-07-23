export type Locale = "es" | "en" | "pt-BR";

export const languageOptions: {
  code: Locale;
  shortLabel: string;
  label: string;
}[] = [
  { code: "es", shortLabel: "ES", label: "Español" },
  { code: "en", shortLabel: "EN", label: "English" },
  { code: "pt-BR", shortLabel: "PT-BR", label: "Português" },
];

export const homeCopy = {
  es: {
    meta: {
      title: "FeatMusic | Publica ideas y crea colaboraciones",
      description:
        "Publica ideas musicales, descubre cantantes, beatmakers y compositores de cualquier ciudad y crea una red de colaboradores alrededor del mundo.",
    },
    header: {
      login: "Iniciar sesión",
      language: "Cambiar idioma",
      selectedLanguage: "Idioma seleccionado",
      navigation: "Navegación principal",
      howItWorks: "Cómo funciona",
      community: "Comunidad",
      plans: "Planes",
    },
    hero: {
      badge: "Donde una idea encuentra la parte que le falta",
      titleOne: "Conecta con artistas.",
      titleTwo: "Crea música sin límites.",
      body:
        "Publica un coro, una letra, una melodía o un instrumental sin terminar. Recibe propuestas y elige con quién completar tu canción.",
      primaryAction: "Crear mi perfil gratis",
      secondaryAction: "Explorar artistas",
    },
    genres: {
      label: "Géneros musicales de la comunidad",
      items: [
        "Reguetón",
        "Trap",
        "Rap",
        "Pop",
        "R&B",
        "Afrobeats",
        "Electrónica",
        "Rock",
        "Salsa",
        "Bachata",
        "Regional mexicano",
      ],
    },
    collaboration: {
      eyebrow: "Colaboraciones que sí encajan",
      title: "Publica lo que tienes. Encuentra lo que le falta.",
      body:
        "Cada audio puede convertirse en una invitación abierta para que otro artista aporte justo la parte que tu canción necesita.",
      imageAlt:
        "Cantantes, beatmaker y compositor colaborando en un estudio de grabación",
      imageEyebrow: "Una idea, distintas posibilidades",
      imageTitle: "Voces y beats que encuentran cómo conectarse",
      imageRoles: [
        { initial: "C", label: "Cantante" },
        { initial: "B", label: "Beatmaker" },
        { initial: "CO", label: "Compositor" },
      ],
      cards: [
        {
          title: "Sube una idea",
          body:
            "Publica el audio, la letra o la melodía que ya tienes y especifica qué parte necesitas para completarla.",
        },
        {
          title: "Recibe propuestas",
          body:
            "Otros perfiles escuchan y descargan tu idea para enviarte una voz, un beat, una letra o una melodía.",
        },
        {
          title: "Tú tomas la decisión",
          body:
            "Acepta o rechaza cada propuesta. Cuando aceptes una, se abrirá un chat privado con esa persona.",
        },
      ],
    },
    demo: {
      eyebrow: "Mira cómo se siente",
      title: "Una idea abierta. Distintas formas de completarla.",
      body:
        "Escucha el punto de partida, conoce exactamente qué necesita el artista y compara las propuestas antes de elegir.",
      benefits: [
        "Nada avanza sin tu aprobación",
        "Chat privado al aceptar",
      ],
      primaryAction: "Publicar una idea",
      secondaryAction: "Explorar ideas",
      previewLabel: "Vista de ejemplo",
      artistName: "Luna R.",
      location: "Cali, Colombia",
      openIdea: "Idea abierta",
      ideaLabel: "Maqueta · Cantante",
      ideaTitle: "Coro de madrugada",
      ideaBody:
        "Tengo listo el coro y dejé un espacio para que otra voz escriba y grabe un verso.",
      tags: ["Reguetón", "96 BPM", "La menor"],
      play: "Reproducir demostración",
      pause: "Pausar demostración",
      duration: "00:42",
      seekingLabel: "Está buscando",
      seekingValue: "Un verso de 16 barras",
      download: "Descargar guía",
      proposalsTitle: "3 propuestas recibidas",
      proposalsCaption: "Escucha cada enfoque antes de tomar una decisión.",
      proposals: [
        {
          initial: "JM",
          name: "Javi M.",
          location: "Tijuana, México",
          style: "Verso melódico",
        },
        {
          initial: "NS",
          name: "Nina S.",
          location: "São Paulo, Brasil",
          style: "Voz bilingüe",
        },
        {
          initial: "KA",
          name: "Kairo A.",
          location: "Madrid, España",
          style: "Verso urbano",
        },
      ],
      decisionTitle: "Tú eliges la propuesta",
      decisionBody:
        "Cuando aceptes una, FeatMusic abrirá un chat privado para continuar la canción.",
    },
    process: {
      eyebrow: "Cómo funciona",
      title: "De una idea incompleta a una colaboración real.",
      body:
        "Tú decides qué parte falta, quién puede proponerla y qué versión quieres llevar hasta el final.",
      steps: [
        {
          title: "Sube tu idea",
          body:
            "Publica el audio de un coro, intro, verso, melodía, maqueta o instrumental sin terminar.",
        },
        {
          title: "Explica qué falta",
          body:
            "Indica si buscas una voz, una letra, una melodía, un beat u otra parte para completar la canción.",
        },
        {
          title: "Recibe propuestas",
          body:
            "Otros artistas descargan tu idea y te envían una voz, un beat, una letra o una melodía como propuesta.",
        },
        {
          title: "Elige y conversa",
          body:
            "Escucha cada propuesta. Al aceptar una, se abrirá un chat privado para continuar.",
        },
      ],
    },
    global: {
      eyebrow: "Talento sin fronteras",
      title: "Encuentra artistas en cualquier parte del mundo.",
      body:
        "Puedes estar en Cali y descubrir en Tijuana una voz, un beatmaker o un compositor que encaje con la canción que tienes en mente.",
      origin: "Cali, Colombia",
      destination: "Tijuana, México",
      routeCaption: "Tu próxima colaboración puede estar en otra ciudad",
      networkTitle: "Una red que crece contigo",
      networkBody:
        "Sigue perfiles y conserva cerca a quienes quieras escuchar o invitar a futuras ideas.",
      cards: [
        {
          title: "Busca por ubicación",
          body:
            "Encuentra cantantes, beatmakers y compositores por país o ciudad, desde tu escena local hasta cualquier lugar del mundo.",
        },
        {
          title: "Escucha antes de participar",
          body:
            "Entra a cada perfil, conoce sus ideas y escucha las propuestas que comparte con la comunidad.",
        },
        {
          title: "Sigue su perfil",
          body:
            "Sigue a los artistas que te interesan y construye una red creativa alrededor de tu sonido.",
        },
      ],
    },
    community: {
      eyebrow: "Tres formas de crear",
      title: "Una comunidad para cantantes, beatmakers y compositores.",
      body:
        "Aquí el centro es la canción: una voz, un beat o una composición pueden convertirse en el comienzo de una colaboración.",
      cards: [
        {
          title: "Cantantes",
          body:
            "Publica coros, versos, intros o maquetas incompletas. Busca otra voz, envía propuestas y elige con quién terminar la canción.",
        },
        {
          title: "Beatmakers",
          body:
            "Sube instrumentales, descubre cantantes de distintas ciudades y encuentra voces que quieran crear una canción sobre tus beats.",
        },
        {
          title: "Compositores",
          body:
            "Publica letras, melodías o maquetas de referencia. Encuentra cantantes que las interpreten y beatmakers que desarrollen la producción.",
        },
      ],
    },
    plans: {
      eyebrow: "Planes claros",
      title: "Elige el espacio que necesita tu música.",
      billingPeriod: "USD al mes",
      cards: [
        {
          label: "Plan gratuito",
          title: "3 espacios",
          body:
            "Mantén hasta 3 ideas activas y recibe un máximo de 3 propuestas en cada una.",
          features: [
            "Hasta 3 ideas activas",
            "3 propuestas por cada idea",
            "Sin comisión por colaborar",
          ],
        },
        {
          label: "Plan Creator",
          title: "10 espacios",
          body:
            "Publica hasta 10 ideas y recibe un máximo de 10 propuestas diferentes en cada una.",
          features: [
            "Hasta 10 ideas activas",
            "Hasta 10 propuestas por idea",
            "Sin comisión por colaborar",
          ],
        },
        {
          label: "Plan Pro",
          title: "20 espacios",
          body:
            "Amplía tu catálogo, destaca tu perfil y participa incluso cuando una idea ya alcanzó su límite normal.",
          features: [
            "Hasta 20 ideas activas",
            "Perfil destacado como artista",
            "Propuestas extra aunque se alcance el límite",
          ],
        },
      ],
      languages: "Español · English · Português do Brasil",
    },
    faq: {
      eyebrow: "Preguntas frecuentes",
      title: "Lo esencial antes de comenzar.",
      clarityTitle: "Respuestas claras",
      clarityBody: "Sin letra pequeña",
      questionLabel: "Pregunta",
      previous: "Pregunta anterior",
      next: "Siguiente pregunta",
      showQuestion: "Mostrar pregunta",
      navigation: "Navegación de preguntas",
      items: [
        {
          question: "¿Qué tipo de idea puedo publicar?",
          answer:
            "Puedes subir un coro, intro, verso, letra, melodía, maqueta, instrumental o cualquier fragmento que todavía necesite otra parte.",
        },
        {
          question: "¿Cómo funciona una propuesta?",
          answer:
            "Una persona escucha tu idea, descarga el material y envía una voz, un beat, una letra o una melodía para que puedas evaluarla.",
        },
        {
          question: "¿Cómo participa un compositor?",
          answer:
            "Puede publicar una letra, melodía o maqueta con audio de referencia, buscar quién la interprete o produzca y también proponer composiciones para ideas de otros perfiles.",
        },
        {
          question: "¿Qué ocurre cuando acepto una propuesta?",
          answer:
            "La propuesta queda seleccionada y se abre un chat privado entre ambos para organizar la colaboración y terminar la canción.",
        },
        {
          question: "¿Qué incluye el plan gratuito?",
          answer:
            "El plan gratuito permite mantener hasta 3 ideas publicadas y recibir hasta 3 propuestas en cada idea.",
        },
        {
          question: "¿Qué cambia con la suscripción?",
          answer:
            "Creator cuesta $5 USD al mes e incluye 10 espacios y hasta 10 propuestas por idea. Pro cuesta $10 USD al mes e incluye 20 espacios, perfil destacado y propuestas extra incluso cuando una idea alcanzó su límite normal.",
        },
        {
          question: "¿Puedo buscar artistas de otra ciudad o país?",
          answer:
            "Sí. Podrás descubrir cantantes, beatmakers y compositores por ubicación, escuchar sus perfiles y participar en ideas publicadas desde cualquier parte del mundo.",
        },
        {
          question: "¿Puedo seguir a otros artistas?",
          answer:
            "Sí. Cada cantante, beatmaker y compositor tendrá un perfil que podrás seguir para mantenerlo dentro de tu red creativa.",
        },
        {
          question: "¿FeatMusic cobrará comisión por las colaboraciones?",
          answer:
            "No. FeatMusic no cobrará comisión por las colaboraciones que se completen dentro de la comunidad.",
        },
      ],
    },
    cta: {
      eyebrow: "Tu próxima canción",
      title: "Puede avanzar con una propuesta.",
      body:
        "Sube la parte que ya tienes, cuenta qué necesita y deja que otros artistas te muestren cómo la continuarían.",
      action: "Crear mi perfil gratis",
    },
    footer: {
      tagline: "Una comunidad para crear música en colaboración.",
      navigation: "Navegación del pie de página",
      howItWorks: "Cómo funciona",
      community: "Comunidad",
      plans: "Planes",
      faq: "Preguntas",
      explore: "Explorar artistas",
      rights: "Tu música, tus decisiones.",
    },
  },
  en: {
    meta: {
      title: "FeatMusic | Share ideas and create collaborations",
      description:
        "Share music ideas, discover singers, beatmakers and songwriters in any city, and build a worldwide network of collaborators.",
    },
    header: {
      login: "Log in",
      language: "Change language",
      selectedLanguage: "Selected language",
      navigation: "Main navigation",
      howItWorks: "How it works",
      community: "Community",
      plans: "Plans",
    },
    hero: {
      badge: "Where an idea finds the part it is missing",
      titleOne: "Connect with artists.",
      titleTwo: "Create music without limits.",
      body:
        "Share an unfinished hook, lyric, melody or instrumental. Receive proposals and choose who you want to finish your song with.",
      primaryAction: "Create my free profile",
      secondaryAction: "Explore artists",
    },
    genres: {
      label: "Music genres in the community",
      items: [
        "Reggaeton",
        "Trap",
        "Rap",
        "Pop",
        "R&B",
        "Afrobeats",
        "Electronic",
        "Rock",
        "Salsa",
        "Bachata",
        "Mexican regional",
      ],
    },
    collaboration: {
      eyebrow: "Collaborations that truly fit",
      title: "Share what you have. Find what it needs.",
      body:
        "Every recording can become an open invitation for another artist to add exactly what your song is missing.",
      imageAlt:
        "Singers, a beatmaker and a songwriter collaborating in a recording studio",
      imageEyebrow: "One idea, many possibilities",
      imageTitle: "Voices and beats finding a way to connect",
      imageRoles: [
        { initial: "S", label: "Singer" },
        { initial: "B", label: "Beatmaker" },
        { initial: "SW", label: "Songwriter" },
      ],
      cards: [
        {
          title: "Share an idea",
          body:
            "Upload the recording, lyric or melody you already have and explain what you need to complete it.",
        },
        {
          title: "Receive proposals",
          body:
            "Other members listen to and download your idea, then send you a voice, beat, lyric or melody.",
        },
        {
          title: "You make the decision",
          body:
            "Accept or decline every proposal. When you accept one, a private chat opens with that person.",
        },
      ],
    },
    demo: {
      eyebrow: "See how it feels",
      title: "One open idea. Different ways to complete it.",
      body:
        "Hear the starting point, understand exactly what the artist needs and compare proposals before choosing.",
      benefits: [
        "Nothing moves forward without your approval",
        "Private chat after acceptance",
      ],
      primaryAction: "Publish an idea",
      secondaryAction: "Explore ideas",
      previewLabel: "Example preview",
      artistName: "Luna R.",
      location: "Cali, Colombia",
      openIdea: "Open idea",
      ideaLabel: "Demo · Singer",
      ideaTitle: "Midnight hook",
      ideaBody:
        "The hook is ready and I left room for another voice to write and record a verse.",
      tags: ["Reggaeton", "96 BPM", "A minor"],
      play: "Play demonstration",
      pause: "Pause demonstration",
      duration: "00:42",
      seekingLabel: "Looking for",
      seekingValue: "A 16-bar verse",
      download: "Download guide",
      proposalsTitle: "3 proposals received",
      proposalsCaption: "Listen to every approach before making a decision.",
      proposals: [
        {
          initial: "JM",
          name: "Javi M.",
          location: "Tijuana, Mexico",
          style: "Melodic verse",
        },
        {
          initial: "NS",
          name: "Nina S.",
          location: "São Paulo, Brazil",
          style: "Bilingual vocal",
        },
        {
          initial: "KA",
          name: "Kairo A.",
          location: "Madrid, Spain",
          style: "Urban verse",
        },
      ],
      decisionTitle: "You choose the proposal",
      decisionBody:
        "Once you accept one, FeatMusic opens a private chat so you can continue the song.",
    },
    process: {
      eyebrow: "How it works",
      title: "From an unfinished idea to a real collaboration.",
      body:
        "You decide what is missing, who can propose it and which version you want to take to the finish line.",
      steps: [
        {
          title: "Upload your idea",
          body:
            "Share an unfinished hook, intro, verse, melody, demo or instrumental.",
        },
        {
          title: "Explain what it needs",
          body:
            "Say whether you need a voice, lyric, melody, beat or another part to complete the song.",
        },
        {
          title: "Receive proposals",
          body:
            "Other artists download your idea and send a voice, beat, lyric or melody as their proposal.",
        },
        {
          title: "Choose and talk",
          body:
            "Listen to every proposal. Once you accept one, a private chat opens so you can continue.",
        },
      ],
    },
    global: {
      eyebrow: "Talent without borders",
      title: "Find artists anywhere in the world.",
      body:
        "You can be in Cali and discover a singer, beatmaker or songwriter in Tijuana who fits the song you have in mind.",
      origin: "Cali, Colombia",
      destination: "Tijuana, Mexico",
      routeCaption: "Your next collaboration could be in another city",
      networkTitle: "A network that grows with you",
      networkBody:
        "Follow profiles and keep the people you want to hear or invite to future ideas close.",
      cards: [
        {
          title: "Search by location",
          body:
            "Find singers, beatmakers and songwriters by country or city, from your local scene to anywhere in the world.",
        },
        {
          title: "Listen before joining",
          body:
            "Open each profile, discover their ideas and listen to the proposals they share with the community.",
        },
        {
          title: "Follow their profile",
          body:
            "Follow the artists you care about and build a creative network around your sound.",
        },
      ],
    },
    community: {
      eyebrow: "Three ways to create",
      title: "A community for singers, beatmakers and songwriters.",
      body:
        "The song is at the center: a voice, a beat or a composition can become the beginning of a collaboration.",
      cards: [
        {
          title: "Singers",
          body:
            "Share unfinished hooks, verses, intros or demos. Find another voice, send proposals and choose who to finish the song with.",
        },
        {
          title: "Beatmakers",
          body:
            "Upload instrumentals, discover singers in different cities and find voices ready to create a song over your beats.",
        },
        {
          title: "Songwriters",
          body:
            "Share lyrics, melodies or reference demos. Find singers to perform them and beatmakers to develop the production.",
        },
      ],
    },
    plans: {
      eyebrow: "Clear plans",
      title: "Choose the space your music needs.",
      billingPeriod: "USD per month",
      cards: [
        {
          label: "Free plan",
          title: "3 spaces",
          body:
            "Keep up to 3 active ideas and receive a maximum of 3 proposals on each one.",
          features: [
            "Up to 3 active ideas",
            "3 proposals for each idea",
            "No collaboration commission",
          ],
        },
        {
          label: "Creator plan",
          title: "10 spaces",
          body:
            "Publish up to 10 ideas and receive a maximum of 10 different proposals on each one.",
          features: [
            "Up to 10 active ideas",
            "Up to 10 proposals per idea",
            "No collaboration commission",
          ],
        },
        {
          label: "Pro plan",
          title: "20 spaces",
          body:
            "Expand your catalog, highlight your profile and participate even when an idea has reached its normal limit.",
          features: [
            "Up to 20 active ideas",
            "Highlighted artist profile",
            "Extra proposals beyond the normal limit",
          ],
        },
      ],
      languages: "Español · English · Português do Brasil",
    },
    faq: {
      eyebrow: "Frequently asked questions",
      title: "What you should know before starting.",
      clarityTitle: "Clear answers",
      clarityBody: "No fine print",
      questionLabel: "Question",
      previous: "Previous question",
      next: "Next question",
      showQuestion: "Show question",
      navigation: "Question navigation",
      items: [
        {
          question: "What kind of idea can I publish?",
          answer:
            "You can share a hook, intro, verse, lyric, melody, demo, instrumental or any fragment that still needs another part.",
        },
        {
          question: "How does a proposal work?",
          answer:
            "Someone listens to your idea, downloads the material and sends a voice, beat, lyric or melody for you to evaluate.",
        },
        {
          question: "How can a songwriter participate?",
          answer:
            "They can share a lyric, melody or demo with reference audio, find someone to perform or produce it, and propose compositions for ideas on other profiles.",
        },
        {
          question: "What happens when I accept a proposal?",
          answer:
            "The proposal is selected and a private chat opens so both people can organize the collaboration and finish the song.",
        },
        {
          question: "What is included in the free plan?",
          answer:
            "The free plan lets you keep up to 3 published ideas and receive up to 3 proposals on each one.",
        },
        {
          question: "What changes with a subscription?",
          answer:
            "Creator costs $5 USD per month and includes 10 spaces with up to 10 proposals per idea. Pro costs $10 USD per month and includes 20 spaces, a highlighted profile and extra proposals even when an idea has reached its normal limit.",
        },
        {
          question: "Can I find artists in another city or country?",
          answer:
            "Yes. You can discover singers, beatmakers and songwriters by location, listen to their profiles and join ideas published anywhere in the world.",
        },
        {
          question: "Can I follow other artists?",
          answer:
            "Yes. Every singer, beatmaker and songwriter will have a profile you can follow and keep in your creative network.",
        },
        {
          question: "Will FeatMusic charge commission on collaborations?",
          answer:
            "No. FeatMusic will not charge commission on collaborations completed within the community.",
        },
      ],
    },
    cta: {
      eyebrow: "Your next song",
      title: "Could move forward with one proposal.",
      body:
        "Share the part you already have, explain what it needs and let other artists show you how they would continue it.",
      action: "Create my free profile",
    },
    footer: {
      tagline: "A community for creating music together.",
      navigation: "Footer navigation",
      howItWorks: "How it works",
      community: "Community",
      plans: "Plans",
      faq: "Questions",
      explore: "Explore artists",
      rights: "Your music, your decisions.",
    },
  },
  "pt-BR": {
    meta: {
      title: "FeatMusic | Publique ideias e crie colaborações",
      description:
        "Publique ideias musicais, descubra cantores, beatmakers e compositores de qualquer cidade e crie uma rede mundial de colaboradores.",
    },
    header: {
      login: "Entrar",
      language: "Mudar idioma",
      selectedLanguage: "Idioma selecionado",
      navigation: "Navegação principal",
      howItWorks: "Como funciona",
      community: "Comunidade",
      plans: "Planos",
    },
    hero: {
      badge: "Onde uma ideia encontra a parte que falta",
      titleOne: "Conecte-se com artistas.",
      titleTwo: "Crie música sem limites.",
      body:
        "Publique um refrão, uma letra, uma melodia ou um instrumental inacabado. Receba propostas e escolha com quem terminar sua música.",
      primaryAction: "Criar meu perfil grátis",
      secondaryAction: "Explorar artistas",
    },
    genres: {
      label: "Gêneros musicais da comunidade",
      items: [
        "Reggaeton",
        "Trap",
        "Rap",
        "Pop",
        "R&B",
        "Afrobeats",
        "Eletrônica",
        "Rock",
        "Salsa",
        "Bachata",
        "Regional mexicano",
      ],
    },
    collaboration: {
      eyebrow: "Colaborações que combinam de verdade",
      title: "Publique o que você tem. Encontre o que falta.",
      body:
        "Cada áudio pode se tornar um convite aberto para outro artista acrescentar exatamente o que sua música precisa.",
      imageAlt:
        "Cantores, beatmaker e compositor colaborando em um estúdio de gravação",
      imageEyebrow: "Uma ideia, muitas possibilidades",
      imageTitle: "Vozes e beats encontrando uma forma de se conectar",
      imageRoles: [
        { initial: "C", label: "Cantor" },
        { initial: "B", label: "Beatmaker" },
        { initial: "CO", label: "Compositor" },
      ],
      cards: [
        {
          title: "Publique uma ideia",
          body:
            "Envie o áudio, a letra ou a melodia que você já tem e explique o que precisa para completá-la.",
        },
        {
          title: "Receba propostas",
          body:
            "Outros perfis escutam e baixam sua ideia para enviar uma voz, um beat, uma letra ou uma melodia.",
        },
        {
          title: "Você toma a decisão",
          body:
            "Aceite ou recuse cada proposta. Ao aceitar uma, um chat privado será aberto com essa pessoa.",
        },
      ],
    },
    demo: {
      eyebrow: "Veja como funciona",
      title: "Uma ideia aberta. Diferentes formas de completá-la.",
      body:
        "Escute o ponto de partida, entenda exatamente o que o artista precisa e compare as propostas antes de escolher.",
      benefits: [
        "Nada avança sem sua aprovação",
        "Chat privado após aceitar",
      ],
      primaryAction: "Publicar uma ideia",
      secondaryAction: "Explorar ideias",
      previewLabel: "Exemplo visual",
      artistName: "Luna R.",
      location: "Cali, Colômbia",
      openIdea: "Ideia aberta",
      ideaLabel: "Demo · Cantora",
      ideaTitle: "Refrão da madrugada",
      ideaBody:
        "O refrão está pronto e deixei espaço para outra voz escrever e gravar um verso.",
      tags: ["Reggaeton", "96 BPM", "Lá menor"],
      play: "Reproduzir demonstração",
      pause: "Pausar demonstração",
      duration: "00:42",
      seekingLabel: "Está procurando",
      seekingValue: "Um verso de 16 barras",
      download: "Baixar guia",
      proposalsTitle: "3 propostas recebidas",
      proposalsCaption: "Escute cada abordagem antes de tomar uma decisão.",
      proposals: [
        {
          initial: "JM",
          name: "Javi M.",
          location: "Tijuana, México",
          style: "Verso melódico",
        },
        {
          initial: "NS",
          name: "Nina S.",
          location: "São Paulo, Brasil",
          style: "Voz bilíngue",
        },
        {
          initial: "KA",
          name: "Kairo A.",
          location: "Madri, Espanha",
          style: "Verso urbano",
        },
      ],
      decisionTitle: "Você escolhe a proposta",
      decisionBody:
        "Ao aceitar uma, a FeatMusic abre um chat privado para continuar a música.",
    },
    process: {
      eyebrow: "Como funciona",
      title: "De uma ideia inacabada a uma colaboração real.",
      body:
        "Você decide o que falta, quem pode propor e qual versão deseja levar até o final.",
      steps: [
        {
          title: "Envie sua ideia",
          body:
            "Publique o áudio de um refrão, intro, verso, melodia, demo ou instrumental inacabado.",
        },
        {
          title: "Explique o que falta",
          body:
            "Indique se procura uma voz, letra, melodia, beat ou outra parte para completar a música.",
        },
        {
          title: "Receba propostas",
          body:
            "Outros artistas baixam sua ideia e enviam uma voz, beat, letra ou melodia como proposta.",
        },
        {
          title: "Escolha e converse",
          body:
            "Escute cada proposta. Ao aceitar uma, um chat privado será aberto para continuar.",
        },
      ],
    },
    global: {
      eyebrow: "Talento sem fronteiras",
      title: "Encontre artistas em qualquer lugar do mundo.",
      body:
        "Você pode estar em Cali e descobrir em Tijuana uma voz, um beatmaker ou um compositor que combine com a música que você imagina.",
      origin: "Cali, Colômbia",
      destination: "Tijuana, México",
      routeCaption: "Sua próxima colaboração pode estar em outra cidade",
      networkTitle: "Uma rede que cresce com você",
      networkBody:
        "Siga perfis e mantenha por perto quem deseja ouvir ou convidar para futuras ideias.",
      cards: [
        {
          title: "Busque por localização",
          body:
            "Encontre cantores, beatmakers e compositores por país ou cidade, da sua cena local a qualquer lugar do mundo.",
        },
        {
          title: "Escute antes de participar",
          body:
            "Entre em cada perfil, conheça suas ideias e escute as propostas compartilhadas com a comunidade.",
        },
        {
          title: "Siga o perfil",
          body:
            "Siga os artistas que interessam a você e crie uma rede criativa ao redor do seu som.",
        },
      ],
    },
    community: {
      eyebrow: "Três formas de criar",
      title: "Uma comunidade para cantores, beatmakers e compositores.",
      body:
        "A música está no centro: uma voz, um beat ou uma composição podem se tornar o começo de uma colaboração.",
      cards: [
        {
          title: "Cantores",
          body:
            "Publique refrões, versos, intros ou demos inacabadas. Encontre outra voz, envie propostas e escolha com quem terminar a música.",
        },
        {
          title: "Beatmakers",
          body:
            "Envie instrumentais, descubra cantores de diferentes cidades e encontre vozes que queiram criar sobre seus beats.",
        },
        {
          title: "Compositores",
          body:
            "Publique letras, melodias ou demos de referência. Encontre cantores para interpretá-las e beatmakers para desenvolver a produção.",
        },
      ],
    },
    plans: {
      eyebrow: "Planos claros",
      title: "Escolha o espaço que sua música precisa.",
      billingPeriod: "USD por mês",
      cards: [
        {
          label: "Plano grátis",
          title: "3 espaços",
          body:
            "Mantenha até 3 ideias ativas e receba no máximo 3 propostas em cada uma.",
          features: [
            "Até 3 ideias ativas",
            "3 propostas por ideia",
            "Sem comissão nas colaborações",
          ],
        },
        {
          label: "Plano Creator",
          title: "10 espaços",
          body:
            "Publique até 10 ideias e receba no máximo 10 propostas diferentes em cada uma.",
          features: [
            "Até 10 ideias ativas",
            "Até 10 propostas por ideia",
            "Sem comissão nas colaborações",
          ],
        },
        {
          label: "Plano Pro",
          title: "20 espaços",
          body:
            "Amplie seu catálogo, destaque seu perfil e participe mesmo quando uma ideia atingir o limite normal.",
          features: [
            "Até 20 ideias ativas",
            "Perfil de artista em destaque",
            "Propostas extras além do limite normal",
          ],
        },
      ],
      languages: "Español · English · Português do Brasil",
    },
    faq: {
      eyebrow: "Perguntas frequentes",
      title: "O essencial antes de começar.",
      clarityTitle: "Respostas claras",
      clarityBody: "Sem letras pequenas",
      questionLabel: "Pergunta",
      previous: "Pergunta anterior",
      next: "Próxima pergunta",
      showQuestion: "Mostrar pergunta",
      navigation: "Navegação das perguntas",
      items: [
        {
          question: "Que tipo de ideia posso publicar?",
          answer:
            "Você pode enviar um refrão, intro, verso, letra, melodia, demo, instrumental ou qualquer fragmento que ainda precise de outra parte.",
        },
        {
          question: "Como funciona uma proposta?",
          answer:
            "Uma pessoa escuta sua ideia, baixa o material e envia uma voz, beat, letra ou melodia para você avaliar.",
        },
        {
          question: "Como um compositor pode participar?",
          answer:
            "Pode publicar uma letra, melodia ou demo com áudio de referência, buscar quem a interprete ou produza e também propor composições para ideias de outros perfis.",
        },
        {
          question: "O que acontece quando aceito uma proposta?",
          answer:
            "A proposta é selecionada e um chat privado é aberto para que as duas pessoas organizem a colaboração e terminem a música.",
        },
        {
          question: "O que está incluído no plano grátis?",
          answer:
            "O plano grátis permite manter até 3 ideias publicadas e receber até 3 propostas em cada ideia.",
        },
        {
          question: "O que muda com a assinatura?",
          answer:
            "O Creator custa US$ 5 por mês e inclui 10 espaços e até 10 propostas por ideia. O Pro custa US$ 10 por mês e inclui 20 espaços, perfil em destaque e propostas extras mesmo quando uma ideia atinge o limite normal.",
        },
        {
          question: "Posso buscar artistas de outra cidade ou país?",
          answer:
            "Sim. Você poderá descobrir cantores, beatmakers e compositores por localização, ouvir seus perfis e participar de ideias publicadas em qualquer parte do mundo.",
        },
        {
          question: "Posso seguir outros artistas?",
          answer:
            "Sim. Cada cantor, beatmaker e compositor terá um perfil que você poderá seguir e manter na sua rede criativa.",
        },
        {
          question: "A FeatMusic cobrará comissão pelas colaborações?",
          answer:
            "Não. A FeatMusic não cobrará comissão pelas colaborações concluídas dentro da comunidade.",
        },
      ],
    },
    cta: {
      eyebrow: "Sua próxima música",
      title: "Pode avançar com uma proposta.",
      body:
        "Envie a parte que você já tem, explique o que ela precisa e deixe outros artistas mostrarem como continuariam.",
      action: "Criar meu perfil grátis",
    },
    footer: {
      tagline: "Uma comunidade para criar música em colaboração.",
      navigation: "Navegação do rodapé",
      howItWorks: "Como funciona",
      community: "Comunidade",
      plans: "Planos",
      faq: "Perguntas",
      explore: "Explorar artistas",
      rights: "Sua música, suas decisões.",
    },
  },
} as const;
