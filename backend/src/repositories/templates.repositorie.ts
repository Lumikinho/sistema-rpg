import {prisma} from "../config/prisma.js";
import type {FieldCategory, FieldType} from "../generated/enums.js";

interface TemplateFieldConfig {
  key: string;
  label: string;
  type: FieldType;
  category: FieldCategory;
  defaultValue?: any;
  options?: string[];
  min?: number;
  max?: number;
  required?: boolean;
}

interface TemplateSectionConfig {
  name: string;
  description?: string;
  fields: TemplateFieldConfig[];
}

function getOrdemParanormalTemplate(): TemplateSectionConfig[] {
  return [
    {
      name: "Informações Gerais",
      description: "Dados básicos do agente e sua posição na Ordem",
      fields: [
        {
          key: "nome",
          label: "Nome do Agente",
          type: "TEXT",
          category: "GENERAL",
          required: true,
        },
        {key: "jogador", label: "Jogador", type: "TEXT", category: "GENERAL"},
        {
          key: "classe",
          label: "Classe",
          type: "SELECT",
          category: "GENERAL",
          options: ["Combatente", "Especialista", "Ocultista", "Mundano"],
          defaultValue: "Combatente",
        },
        {
          key: "trilha",
          label: "Trilha",
          type: "TEXT",
          category: "GENERAL",
          defaultValue: "Aniquilador",
        },
        {
          key: "origem",
          label: "Origem",
          type: "TEXT",
          category: "GENERAL",
          defaultValue: "Acadêmico",
        },
        {
          key: "patente",
          label: "Patente",
          type: "SELECT",
          category: "GENERAL",
          options: [
            "Recruta",
            "Operador",
            "Agente Especial",
            "Oficial de Operações",
            "Agente de Elite",
          ],
          defaultValue: "Recruta",
        },
        {
          key: "nex",
          label: "NEX (%)",
          type: "NUMBER",
          category: "GENERAL",
          defaultValue: 5,
          min: 0,
          max: 100,
        },
        {
          key: "deslocamento",
          label: "Deslocamento (m)",
          type: "NUMBER",
          category: "GENERAL",
          defaultValue: 9,
        },
        {
          key: "pe_rodada",
          label: "Limite de PE/Rodada",
          type: "NUMBER",
          category: "GENERAL",
          defaultValue: 1,
        },
      ],
    },
    {
      name: "Atributos",
      description: "Os 5 atributos fundamentais de Ordem Paranormal",
      fields: [
        {
          key: "agilidade",
          label: "Agilidade (AGI)",
          type: "NUMBER",
          category: "ATTRIBUTE",
          defaultValue: 1,
          min: 0,
          max: 5,
        },
        {
          key: "forca",
          label: "Força (FOR)",
          type: "NUMBER",
          category: "ATTRIBUTE",
          defaultValue: 1,
          min: 0,
          max: 5,
        },
        {
          key: "intelecto",
          label: "Intelecto (INT)",
          type: "NUMBER",
          category: "ATTRIBUTE",
          defaultValue: 1,
          min: 0,
          max: 5,
        },
        {
          key: "presenca",
          label: "Presença (PRE)",
          type: "NUMBER",
          category: "ATTRIBUTE",
          defaultValue: 1,
          min: 0,
          max: 5,
        },
        {
          key: "vigor",
          label: "Vigor (VIG)",
          type: "NUMBER",
          category: "ATTRIBUTE",
          defaultValue: 1,
          min: 0,
          max: 5,
        },
      ],
    },
    {
      name: "Status Vitais & Defesa",
      description: "Recursos vitais de sobrevivência e defesa",
      fields: [
        {
          key: "pv_atual",
          label: "Pontos de Vida Atuais (PV)",
          type: "NUMBER",
          category: "STATISTIC",
          defaultValue: 20,
        },
        {
          key: "pv_max",
          label: "Pontos de Vida Máximos",
          type: "NUMBER",
          category: "STATISTIC",
          defaultValue: 20,
        },
        {
          key: "san_atual",
          label: "Sanidade Atual (SAN)",
          type: "NUMBER",
          category: "STATISTIC",
          defaultValue: 20,
        },
        {
          key: "san_max",
          label: "Sanidade Máxima",
          type: "NUMBER",
          category: "STATISTIC",
          defaultValue: 20,
        },
        {
          key: "pe_atual",
          label: "Pontos de Esforço Atuais (PE)",
          type: "NUMBER",
          category: "STATISTIC",
          defaultValue: 4,
        },
        {
          key: "pe_max",
          label: "Pontos de Esforço Máximos",
          type: "NUMBER",
          category: "STATISTIC",
          defaultValue: 4,
        },
        {
          key: "defesa",
          label: "Defesa Passiva",
          type: "NUMBER",
          category: "COMBAT",
          defaultValue: 11,
        },
        {
          key: "bloqueio",
          label: "Bloqueio",
          type: "NUMBER",
          category: "COMBAT",
          defaultValue: 0,
        },
        {
          key: "esquiva",
          label: "Esquiva",
          type: "NUMBER",
          category: "COMBAT",
          defaultValue: 0,
        },
      ],
    },
    {
      name: "Perícias",
      description: "Treinamentos e bônus em perícias",
      fields: [
        "acrobacia",
        "adestramento",
        "artes",
        "atletismo",
        "atualidades",
        "ciencias",
        "crime",
        "diplomacia",
        "enganacao",
        "fortitude",
        "furtividade",
        "iniciativa",
        "intimidacao",
        "intuicao",
        "investigacao",
        "luta",
        "medicina",
        "ocultismo",
        "percepcao",
        "pilotagem",
        "pontaria",
        "profissao",
        "reflexos",
        "religiao",
        "sobrevivencia",
        "tatica",
        "tecnologia",
        "vontade",
      ].map((p) => {
        const capitalized = p.charAt(0).toUpperCase() + p.slice(1);
        return {
          key: p,
          label: capitalized,
          type: "NUMBER" as FieldType,
          category: "SKILL" as FieldCategory,
          defaultValue: 0,
        };
      }),
    },
    {
      name: "Ataques e Armas",
      description: "Armas empunhadas, dano, teste e alcance",
      fields: [
        {
          key: "armas",
          label: "Armas e Ataques",
          type: "TEXTAREA",
          category: "COMBAT",
          defaultValue: "Pistola | Teste: Pontaria | Dano: 1d12 Balístico | Crítico: 19/x3 | Alcance: Curto",
        },
      ],
    },
    {
      name: "Habilidades & Rituais",
      description: "Poderes de classe, origem e rituais conhecidos",
      fields: [
        {
          key: "habilidades",
          label: "Habilidades e Poderes",
          type: "TEXTAREA",
          category: "CUSTOM",
          defaultValue: "Ataque Especial (1 PE): +5 no teste de ataque ou na rolagem de dano.",
        },
        {
          key: "rituais",
          label: "Rituais Paranormais",
          type: "TEXTAREA",
          category: "CUSTOM",
          defaultValue: "",
        },
      ],
    },
    {
      name: "Inventário & Carga",
      description: "Itens transportados pelo agente",
      fields: [
        {
          key: "espaco_atual",
          label: "Espaço Ocupado",
          type: "NUMBER",
          category: "INVENTORY",
          defaultValue: 2,
        },
        {
          key: "espaco_max",
          label: "Capacidade de Carga",
          type: "NUMBER",
          category: "INVENTORY",
          defaultValue: 10,
        },
        {
          key: "itens",
          label: "Itens e Equipamentos",
          type: "TEXTAREA",
          category: "INVENTORY",
          defaultValue: "- Uniforme da Ordem (1 esp)\n- Celular com comunicador (1 esp)\n- Lanterna tática (1 esp)",
        },
      ],
    },
    {
      name: "Histórico & Anotações",
      description: "Antecedentes e anotações do investigador",
      fields: [
        {
          key: "historia",
          label: "Histórico e Aparência",
          type: "TEXTAREA",
          category: "BACKGROUND",
          defaultValue: "",
        },
        {
          key: "anotacoes",
          label: "Anotações de Investigação",
          type: "TEXTAREA",
          category: "BACKGROUND",
          defaultValue: "",
        },
      ],
    },
  ];
}

function getD20SystemTemplate(systemName: string): TemplateSectionConfig[] {
  return [
    {
      name: "Informações Básicas",
      fields: [
        {
          key: "nome",
          label: "Nome do Personagem",
          type: "TEXT",
          category: "GENERAL",
          required: true,
        },
        {key: "jogador", label: "Jogador", type: "TEXT", category: "GENERAL"},
        {key: "classe", label: "Classe", type: "TEXT", category: "GENERAL"},
        {key: "raca", label: "Raça / Ancestralidade", type: "TEXT", category: "GENERAL"},
        {
          key: "nivel",
          label: "Nível",
          type: "NUMBER",
          category: "GENERAL",
          defaultValue: 1,
          min: 1,
          max: 20,
        },
        {key: "origem", label: "Origem / Antecedente", type: "TEXT", category: "GENERAL"},
        {key: "alinhamento", label: "Tendência / Alinhamento", type: "TEXT", category: "GENERAL"},
      ],
    },
    {
      name: "Atributos",
      fields: [
        {
          key: "forca",
          label: "Força (FOR)",
          type: "NUMBER",
          category: "ATTRIBUTE",
          defaultValue: 10,
        },
        {
          key: "destreza",
          label: "Destreza (DES)",
          type: "NUMBER",
          category: "ATTRIBUTE",
          defaultValue: 10,
        },
        {
          key: "constituicao",
          label: "Constituição (CON)",
          type: "NUMBER",
          category: "ATTRIBUTE",
          defaultValue: 10,
        },
        {
          key: "inteligencia",
          label: "Inteligência (INT)",
          type: "NUMBER",
          category: "ATTRIBUTE",
          defaultValue: 10,
        },
        {
          key: "sabedoria",
          label: "Sabedoria (SAB)",
          type: "NUMBER",
          category: "ATTRIBUTE",
          defaultValue: 10,
        },
        {
          key: "carisma",
          label: "Carisma (CAR)",
          type: "NUMBER",
          category: "ATTRIBUTE",
          defaultValue: 10,
        },
      ],
    },
    {
      name: "Status Vitais & Combate",
      fields: [
        {
          key: "pv_atual",
          label: "Pontos de Vida Atuais",
          type: "NUMBER",
          category: "STATISTIC",
          defaultValue: 12,
        },
        {
          key: "pv_max",
          label: "Pontos de Vida Máximos",
          type: "NUMBER",
          category: "STATISTIC",
          defaultValue: 12,
        },
        {
          key: "pm_atual",
          label: "Pontos de Magia / Mana",
          type: "NUMBER",
          category: "STATISTIC",
          defaultValue: 5,
        },
        {
          key: "pm_max",
          label: "Mana Máxima",
          type: "NUMBER",
          category: "STATISTIC",
          defaultValue: 5,
        },
        {
          key: "ca_defesa",
          label: "Classe de Armadura / Defesa",
          type: "NUMBER",
          category: "COMBAT",
          defaultValue: 10,
        },
        {
          key: "iniciativa",
          label: "Bônus de Iniciativa",
          type: "NUMBER",
          category: "COMBAT",
          defaultValue: 0,
        },
        {
          key: "deslocamento",
          label: "Deslocamento (m)",
          type: "NUMBER",
          category: "COMBAT",
          defaultValue: 9,
        },
      ],
    },
    {
      name: "Ataques e Armas",
      fields: [
        {
          key: "armas",
          label: "Armas e Ataques",
          type: "TEXTAREA",
          category: "COMBAT",
          defaultValue: "Espada Longa | Ataque: +3 | Dano: 1d8+2 Cortante",
        },
      ],
    },
    {
      name: "Habilidades & Magias",
      fields: [
        {
          key: "habilidades",
          label: "Habilidades Especiais & Talentos",
          type: "TEXTAREA",
          category: "CUSTOM",
          defaultValue: "",
        },
        {
          key: "magias",
          label: "Magias Conhecidas & Preparadas",
          type: "TEXTAREA",
          category: "CUSTOM",
          defaultValue: "",
        },
      ],
    },
    {
      name: "Equipamento & Tesouro",
      fields: [
        {
          key: "moedas",
          label: "Moedas de Ouro / Tibares",
          type: "NUMBER",
          category: "INVENTORY",
          defaultValue: 50,
        },
        {
          key: "inventario",
          label: "Itens e Equipamentos",
          type: "TEXTAREA",
          category: "INVENTORY",
          defaultValue: "- Mochila de aventureiro\n- Tochas (5)\n- Odre de água",
        },
      ],
    },
    {
      name: "Anotações & Histórico",
      fields: [
        {
          key: "historia",
          label: "Histórico do Personagem",
          type: "TEXTAREA",
          category: "BACKGROUND",
          defaultValue: "",
        },
        {
          key: "notas",
          label: "Anotações Gerais",
          type: "TEXTAREA",
          category: "BACKGROUND",
          defaultValue: "",
        },
      ],
    },
  ];
}

const templateInclude = {
  versions: {
    where: {status: "PUBLISHED" as const},
    include: {
      sections: {
        orderBy: {order: "asc" as const},
        include: {
          fields: {
            orderBy: {order: "asc" as const},
          },
        },
      },
      fields: {
        orderBy: {order: "asc" as const},
      },
    },
  },
  publishedVersion: {
    include: {
      sections: {
        orderBy: {order: "asc" as const},
        include: {
          fields: {
            orderBy: {order: "asc" as const},
          },
        },
      },
      fields: {
        orderBy: {order: "asc" as const},
      },
    },
  },
} as const;

export const templatesRepository = {
  buscarPorCampanha: async (campaignId: string) => {
    return prisma.sheetTemplates.findFirst({
      where: {campaignId},
      include: templateInclude,
    });
  },

  garantirTemplatePadrao: async (
    campaignId: string,
    createdById: string,
  ) => {
    // 1. Já existe template publicado para a campanha?
    const existing = await prisma.sheetTemplates.findFirst({
      where: {campaignId},
      include: templateInclude,
    });

    if (existing && existing.publishedVersion) {
      return existing;
    }

    // 2. Busca informações da campanha para checar o sistema de jogo
    const campaign = await prisma.campanhas.findUnique({
      where: {id: campaignId},
      include: {gameSystem: true},
    });

    if (!campaign) {
      throw new Error("Campanha não encontrada para criar template.");
    }

    const systemSlug = campaign.gameSystem?.slug ?? "generico";
    const systemName = campaign.gameSystem?.name ?? "RPG Genérico";

    let sectionsConfig: TemplateSectionConfig[];
    if (systemSlug === "ordem-paranormal") {
      sectionsConfig = getOrdemParanormalTemplate();
    } else {
      sectionsConfig = getD20SystemTemplate(systemName);
    }

    const templateName = `Ficha Oficial - ${systemName}`;

    // 3. Cria o template, versão publicada, seções e campos em transação
    return prisma.$transaction(async (tx) => {
      const template = await tx.sheetTemplates.create({
        data: {
          campaignId,
          createdById,
          name: templateName,
          description: `Modelo de ficha padrão adaptado para ${systemName}.`,
        },
      });

      const version = await tx.sheetTemplateVersions.create({
        data: {
          templateId: template.id,
          version: 1,
          status: "PUBLISHED",
          description: "Versão inicial automática",
          publishedAt: new Date(),
        },
      });

      let sectionOrder = 0;
      for (const sec of sectionsConfig) {
        const section = await tx.sheetSections.create({
          data: {
            versionId: version.id,
            name: sec.name,
            description: sec.description ?? null,
            order: sectionOrder++,
          },
        });

        let fieldOrder = 0;
        for (const f of sec.fields) {
          await tx.fieldDefinitions.create({
            data: {
              versionId: version.id,
              sectionId: section.id,
              key: f.key,
              label: f.label,
              type: f.type,
              category: f.category,
              defaultValue: f.defaultValue !== undefined ? f.defaultValue : null,
              options: f.options ? (f.options as any) : null,
              min: f.min ?? null,
              max: f.max ?? null,
              required: f.required ?? false,
              order: fieldOrder++,
            },
          });
        }
      }

      await tx.sheetTemplates.update({
        where: {id: template.id},
        data: {publishedVersionId: version.id},
      });

      return tx.sheetTemplates.findUniqueOrThrow({
        where: {id: template.id},
        include: templateInclude,
      });
    });
  },
};
