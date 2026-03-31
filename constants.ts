
import { User, Post, Notification, Message, Event, Banner, LibraryItem, Testimonial } from './types';

export const DEFAULT_AVATAR_URL = 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y';

export const mockUsers: User[] = [
  {
    id: 1,
    name: 'Ana Silva',
    username: 'anasilva',
    avatarUrl: 'https://picsum.photos/id/1011/100/100',
    coverUrl: 'https://picsum.photos/id/1018/1000/300',
    bio: 'Desenvolvedora Front-end apaixonada por React e design. Amante de café e de um bom livro.',
    profession: 'Desenvolvedora Front-end',
    birthDate: '1995-05-15',
    maritalStatus: 'Solteira',
    postsCount: 28,
    followersCount: 1250,
    followingCount: 320,
    connections: [2, 4],
    favorites: [3, 4],
    role: 'master',
    status: 'active',
    settings: {
      notifications: {
        likes: true,
        comments: true,
        followers: true,
      },
      appearance: {
        theme: 'dark',
      },
    },
    mission: 'Minha missão é inspirar pessoas a viverem com propósito e paixão, utilizando a tecnologia para criar conexões autênticas e significativas.',
    evoStatus: {
      pelopes: false,
      academy: true,
      family: false,
      leader: true,
      teamEngineering: false,
      missions: true,
      missionsLeader: false,
      legacy: false,
      eagles: false,
      trainer: false,
      headTrainer: false,
      partners: false,
      dominios: true,
    },
    classYear: '2022',
    helpArea: 'Desenvolvimento Front-end, UX/UI Design, Gestão de Projetos Ágeis.',
    behavioralProfile: '🟡 Influente',
    location: {
      fullAddress: 'Rua das Flores, 123, Apto 45',
      zipCode: '01234-567',
      city: 'São Paulo',
      state: 'SP',
      country: 'Brasil',
    },
    socials: {
      instagram: 'anasilva.dev',
      whatsapp: '+5511912345678',
      linkedin: 'linkedin.com/in/anasilvadev',
    },
    gallery: [
      'https://picsum.photos/id/10/400/400',
      'https://picsum.photos/id/20/400/400',
    ],
  },
  {
    id: 2,
    name: 'Bruno Costa',
    username: 'brunocosta',
    avatarUrl: 'https://picsum.photos/id/1005/100/100',
    coverUrl: 'https://picsum.photos/id/1041/1000/300',
    connections: [1],
    bio: 'Fotógrafo e viajante. Explorando o mundo uma foto de cada vez.',
    profession: 'Fotógrafo',
    birthDate: '1988-11-20',
    maritalStatus: 'Casado',
    location: { city: 'Rio de Janeiro', state: 'RJ', fullAddress: 'Avenida Copacabana, 500' },
    evoStatus: {
      pelopes: false,
      academy: false,
      family: true,
      leader: false,
      teamEngineering: false,
      missions: false,
      missionsLeader: false,
      legacy: false,
      eagles: false,
      trainer: false,
      headTrainer: false,
      partners: true,
      dominios: false,
    },
    behavioralProfile: '🔴 Dominante',
    role: 'user',
    status: 'active',
    mission: 'Eternizar momentos únicos e revelar a beleza escondida no cotidiano através das minhas lentes.',
    helpArea: 'Fotografia profissional, Edição de fotos (Lightroom/Photoshop), Dicas de Viagem e Roteiros.',
    socials: {
      instagram: 'brunocosta.ph',
      linkedin: 'brunocostaph',
    },
    gallery: [
      'https://picsum.photos/id/101/400/400',
      'https://picsum.photos/id/102/400/400',
      'https://picsum.photos/id/103/400/400',
    ],
  },
  {
    id: 3,
    name: 'Carla Dias',
    username: 'carladias',
    avatarUrl: 'https://picsum.photos/id/1027/100/100',
    coverUrl: 'https://picsum.photos/id/1050/1000/300',
    connections: [],
    bio: 'Chef de cozinha e entusiasta de gastronomia saudável. Acredito que cozinhar é um ato de amor.',
    profession: 'Chef de Cozinha',
    birthDate: '1992-04-05',
    maritalStatus: 'Divorciada',
    location: { city: 'Belo Horizonte', state: 'MG', fullAddress: 'Praça da Liberdade, 10' },
    evoStatus: {
      pelopes: true,
      academy: true,
      family: true,
      leader: false,
      teamEngineering: false,
      missions: false,
      missionsLeader: false,
      legacy: false,
      eagles: false,
      trainer: false,
      headTrainer: false,
      partners: false,
      dominios: false,
    },
    behavioralProfile: '🟢 Estável',
    role: 'user',
    status: 'active',
    mission: 'Levar saúde e sabor para a mesa das pessoas, transformando a alimentação em um momento de conexão.',
    helpArea: 'Gastronomia saudável, Personal Chef, Planejamento de Cardápios, Workshops Culinários.',
    socials: {
      instagram: 'chefcarladias',
      whatsapp: '+5531999999999',
    },
    gallery: [
      'https://picsum.photos/id/292/400/400',
      'https://picsum.photos/id/225/400/400',
    ],
  },
  {
    id: 4,
    name: 'Daniel Rocha',
    username: 'danielrocha',
    avatarUrl: 'https://picsum.photos/id/10/100/100',
    coverUrl: 'https://picsum.photos/id/106/1000/300',
    connections: [1],
    bio: 'Músico, compositor e produtor. O som é minha vida e minha forma de expressão.',
    profession: 'Músico',
    birthDate: '1990-08-30',
    maritalStatus: 'União Estável',
    location: { city: 'Salvador', state: 'BA', fullAddress: 'Largo do Pelourinho, 20' },
    evoStatus: {
      pelopes: false,
      academy: false,
      family: false,
      leader: false,
      teamEngineering: false,
      missions: false,
      missionsLeader: false,
      legacy: false,
      eagles: true,
      trainer: true,
      headTrainer: false,
      partners: false,
      dominios: true,
    },
    behavioralProfile: '🔵🔴 Analítico + Dominante',
    role: 'user',
    status: 'active',
    mission: 'Inspirar e conectar almas através da vibração da música, criando trilhas sonoras para a vida.',
    helpArea: 'Produção Musical, Composição, Aulas de Violão e Teoria Musical.',
    socials: {
      instagram: 'danielrocha.music',
      whatsapp: '+5571988888888',
      linkedin: 'daniel-rocha-music',
    },
    gallery: [
      'https://picsum.photos/id/145/400/400',
      'https://picsum.photos/id/158/400/400',
    ],
  },
];

export const currentUser: User = mockUsers[0];

export const mockPosts: Post[] = [
  {
    id: 100,
    author: mockUsers[0], // Ana Silva (Master)
    content: 'Sejam bem-vindos à Comunidade Oficial EvoCommunity! 💜\n\nEste é o nosso espaço seguro para conexões reais e evolução constante. Aqui você pode encontrar parceiros de missão, compartilhar seus aprendizados e ficar por dentro de tudo que acontece no nosso ecossistema.\n\nSintam-se em casa. O Amor Radical nos une! 🚀',
    likes: 1250,
    comments: 342,
    timestamp: 'Fixado',
    isLiked: true,
    isPinned: true,
  },
  {
    id: 1,
    author: mockUsers[1],
    content: 'Acabei de voltar de uma viagem incrível pelas montanhas. A vista era de tirar o fôlego! 🏔️ #viagem #natureza #aventura',
    imageUrl: 'https://picsum.photos/id/1015/600/400',
    likes: 128,
    comments: 15,
    timestamp: '2h atrás',
    isLiked: false,
  },
  {
    id: 2,
    author: mockUsers[2],
    content: 'Experimentando uma nova receita de café hoje. O resultado foi surpreendente! Quem mais é apaixonado por um bom café? ☕️ #café #receitas #bomdia',
    likes: 256,
    comments: 32,
    timestamp: '5h atrás',
    isLiked: true,
  },
  {
    id: 3,
    author: mockUsers[3],
    content: 'Mergulhado em um novo projeto de codificação. Usando React e Tailwind para criar uma interface super moderna. O que vocês acham da combinação? #dev #reactjs #tailwindcss',
    imageUrl: 'https://picsum.photos/id/2/600/400',
    likes: 98,
    comments: 21,
    timestamp: '1d atrás',
    isLiked: false,
  },
  {
    id: 4,
    author: mockUsers[0],
    content: 'Dia produtivo de trabalho em home office. É incrível como um ambiente organizado ajuda na concentração. #homeoffice #produtividade',
    likes: 77,
    comments: 12,
    timestamp: '2d atrás',
    isLiked: true,
  },
];

export const mockNotifications: Notification[] = [
  {
    id: '1',
    user_id: 'user-1',
    actor: {
      id: 'user-2',
      name: 'Maria Silva',
      username: 'mariasilva',
      avatar_url: 'https://i.pravatar.cc/150?u=2',
    },
    action: 'curtiu seu post:',
    target: 'Experimentando uma nova receita...',
    created_at: new Date().toISOString(),
    is_read: false
  },
  {
    id: '2',
    user_id: 'user-1',
    actor: {
      id: 'user-3',
      name: 'João Souza',
      username: 'joaosouza',
      avatar_url: 'https://i.pravatar.cc/150?u=3',
    },
    action: 'começou a seguir você.',
    created_at: new Date(Date.now() - 3600000).toISOString(),
    is_read: true
  },
  {
    id: '3',
    user_id: 'user-1',
    actor: {
      id: 'user-4',
      name: 'Pedro Alves',
      username: 'pedroalves',
      avatar_url: 'https://i.pravatar.cc/150?u=4',
    },
    action: 'comentou em seu post:',
    target: 'Dia produtivo de trabalho...',
    created_at: new Date(Date.now() - 10800000).toISOString(),
    is_read: true
  },
  {
    id: '4',
    user_id: 'user-1',
    actor: {
      id: 'user-2',
      name: 'Maria Silva',
      username: 'mariasilva',
      avatar_url: 'https://i.pravatar.cc/150?u=2',
    },
    action: 'curtiu seu post:',
    target: 'Dia produtivo de trabalho...',
    created_at: new Date(Date.now() - 86400000).toISOString(),
    is_read: true
  }
];

export const mockMessages: Message[] = [
  { id: 1, senderId: 2, receiverId: 1, text: 'Olá Ana! Tudo bem?', timestamp: '10:00' },
  { id: 2, senderId: 1, receiverId: 2, text: 'Oi Bruno! Tudo ótimo por aqui, e com você?', timestamp: '10:01' },
  { id: 3, senderId: 2, receiverId: 1, text: 'Também estou bem, obrigado! Vi suas fotos da viagem, ficaram incríveis!', timestamp: '10:01' },
  { id: 4, senderId: 1, receiverId: 2, text: 'Ah, que bom que gostou! Foi uma experiência fantástica.', timestamp: '10:02' },
  { id: 5, senderId: 2, receiverId: 1, text: 'Podemos marcar de conversar sobre fotografia um dia desses.', timestamp: '10:03' },
  { id: 6, senderId: 1, receiverId: 2, text: 'Claro! Seria ótimo!', timestamp: '10:04' },
  { id: 7, senderId: 4, receiverId: 1, text: 'E aí, Ana! Preparada para o ensaio de amanhã?', timestamp: '11:30' },
  { id: 8, senderId: 1, receiverId: 4, text: 'Com certeza, Daniel! Levarei meu violão novo.', timestamp: '11:32' },
  { id: 9, senderId: 3, receiverId: 1, text: 'Ana, preciso daquela sua receita de bolo de cenoura!', timestamp: '14:15' },
  { id: 10, senderId: 1, receiverId: 3, text: 'Oi Carla! Mando sim, um segundo.', timestamp: '14:16' }
];

export const mockEvents: Event[] = [
  {
    id: '1',
    title: 'Imersão EVO 2025',
    description: 'Um final de semana intenso de autoconhecimento e evolução pessoal. Prepare-se para transformar sua vida.',
    display_date: '15 Mar, 2025',
    display_time: '09:00 - 18:00',
    location: 'Centro de Convenções, SP',
    image_url: 'https://static.wixstatic.com/media/8c7f55_fedd72f4d78d4276a4c28029b91ca65d~mv2.png',
    category: 'Imersão Inteligência Emocionao',
    link: 'https://example.com/evento-1',
    archived: false,
  },
  {
    id: '2',
    title: 'Mentalidade de Cura',
    description: 'Eu vou te ajudar a dar os primeiros passos em direção à vida que você merece.',
    display_date: '22 Mar, 2025',
    display_time: '19:00 - 21:30',
    location: 'Online (Zoom)',
    image_url: 'https://static.wixstatic.com/media/8c7f55_592e776ef5e14f29a30ed42c09bc20f4~mv2.png',
    category: 'Workshop Online',
    link: 'https://example.com/evento-2',
    archived: false,
  },
  {
    id: '3',
    title: 'Amantes Radicais de Pessoas',
    description: 'Ative todo o seu potencial e construa um caminho sem limites!',
    display_date: '05 Abr, 2025',
    display_time: '14:00 - 18:00',
    location: 'Hotel Plaza, Rio de Janeiro',
    image_url: 'https://static.wixstatic.com/media/8c7f55_5488de325bb346ac99d28f48de2e617e~mv2.png',
    category: 'Encontro',
    link: 'https://example.com/evento-3',
    archived: false,
  },
  {
    id: '4',
    title: 'Método EVO',
    description: 'Supere suas limitações e alcance os resultados que você merece!.',
    display_date: '12 Abr, 2025',
    display_time: '20:00 - 21:30',
    location: 'Auditório Principal, Belo Horizonte',
    image_url: 'https://static.wixstatic.com/media/8c7f55_0213ef755d8841ffba39ed8f9cacd93a~mv2.png',
    category: 'Palestra',
    link: 'https://example.com/evento-4',
    archived: false,
  }
];

export const mockBanners: Banner[] = [
  { id: 1, imageUrl: 'https://picsum.photos/id/1043/1200/400', title: 'Conecte-se com a Comunidade', description: 'Participe de discussões, compartilhe suas ideias.', active: true },
  { id: 2, imageUrl: 'https://picsum.photos/id/1044/1200/400', title: 'Eventos Exclusivos', description: 'Fique por dentro dos próximos encontros.', active: true },
];

export const mockLibraryItems: LibraryItem[] = [
  { id: 1, title: 'Manual de Cultura EVO', type: 'pdf', category: 'Documentos', url: '#' },
  { id: 2, title: 'Logo Oficial (PNG)', type: 'image', category: 'Marketing', url: '#' },
  { id: 3, title: 'Palestra Magna 2024', type: 'video', category: 'Vídeos', url: '#' },
];

export const mockTestimonials: Testimonial[] = [
  {
    id: 1,
    senderId: 2, // Bruno Costa
    receiverId: 1, // Ana Silva
    message: "Ana é uma profissional incrível e um ser humano de luz! Foi um prazer trabalhar com ela e aprender tanto sobre frontend e vida.",
    date: "10 Mar, 2025",
    privacy: "public",
    status: 'approved'
  },
  {
    id: 2,
    senderId: 3, // Carla Dias
    receiverId: 1, // Ana Silva
    message: "Obrigada por todo o apoio no projeto da minha nova marca. Sua dedicação é inspiradora!",
    date: "05 Mar, 2025",
    privacy: "public",
    status: 'approved'
  },
  {
    id: 3,
    senderId: 4, // Daniel Rocha
    receiverId: 1, // Ana Silva
    message: "Admiro muito sua jornada e como você equilibra técnica com humanidade. Parabéns!",
    date: "28 Fev, 2025",
    privacy: "private",
    status: 'approved'
  },
  {
    id: 4,
    senderId: 1, // Ana Silva
    receiverId: 2, // Bruno Costa
    message: "Bruno, suas fotos capturam a alma das pessoas. Você é um artista nato!",
    date: "12 Mar, 2025",
    privacy: "public",
    status: 'approved'
  },
  {
    id: 5,
    senderId: 2, // Bruno Costa
    receiverId: 1, // Ana Silva
    message: "Ana, gratidão pela mentoria de ontem. Me ajudou a clarear muitas ideias sobre minha carreira!",
    date: "14 Mar, 2025",
    privacy: "public",
    status: 'pending'
  }
];
