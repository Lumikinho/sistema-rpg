import type {Request, Response} from "express";

import {
  campaignsRepository,
  type CampaignComInclude,
} from "../repositories/campaigns.repositorie.js";
import {gameSystemsRepository} from "../repositories/game-systems.repositorie.js";
import {createCampaignSchema} from "../schemas/campaigns.schema.js";

function toCampaignDTO(campaign: CampaignComInclude, userId: string) {
  const myMembership = campaign.members.find(
    (member) => member.user.id === userId,
  );
  const myRole =
    campaign.ownerId === userId ? "MASTER" : (myMembership?.role ?? "PLAYER");

  const {members, _count, ...rest} = campaign;

  return {
    ...rest,
    myRole,
    memberCount: members.length,
    characterCount: _count.characters,
    sessionCount: _count.sessions,
    members,
  };
}

export const campaignsController = {
  listar: async (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(401).json({message: "Não autenticado."});
    }

    const userId = req.user.id;
    const campaigns = await campaignsRepository.listarDoUsuario(userId);

    return res
      .status(200)
      .json(campaigns.map((campaign) => toCampaignDTO(campaign, userId)));
  },

  buscarPorId: async (req: Request<{id: string}>, res: Response) => {
    if (!req.user) {
      return res.status(401).json({message: "Não autenticado."});
    }

    const campaign = await campaignsRepository.buscarDoUsuario(
      req.params.id,
      req.user.id,
    );

    if (!campaign) {
      return res.status(404).json({message: "Campanha não encontrada."});
    }

    return res.status(200).json(toCampaignDTO(campaign, req.user.id));
  },

  criar: async (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(401).json({message: "Não autenticado."});
    }

    const data = createCampaignSchema.parse(req.body);

    if (data.gameSystemId) {
      const gameSystem = await gameSystemsRepository.existePorId(
        data.gameSystemId,
      );

      if (!gameSystem) {
        return res
          .status(400)
          .json({message: "Sistema de jogo não encontrado."});
      }
    }

    const campaign = await campaignsRepository.criar(data, req.user.id);

    return res.status(201).json(toCampaignDTO(campaign, req.user.id));
  },
};
