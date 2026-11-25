import type {Request, Response} from "express";

import {campaignMembersRepository} from "../repositories/campaign-members.repositorie.js";
import {usersRepository} from "../repositories/users.repositorie.js";
import {
  addCampaignMemberSchema,
  updateCampaignMemberSchema,
} from "../schemas/campaign-members.schema.js";

export const campaignMembersController = {
  listar: async (req: Request<{campaignId: string}>, res: Response) => {
    if (!req.user) {
      return res.status(401).json({message: "Não autenticado."});
    }

    const {campaignId} = req.params;
    const {isMember} = await campaignMembersRepository.obterPermissao(
      campaignId,
      req.user.id,
    );

    if (!isMember) {
      return res
        .status(403)
        .json({message: "Você não tem acesso a esta campanha."});
    }

    const members =
      await campaignMembersRepository.listarPorCampanha(campaignId);
    return res.status(200).json(members);
  },

  adicionar: async (req: Request<{campaignId: string}>, res: Response) => {
    if (!req.user) {
      return res.status(401).json({message: "Não autenticado."});
    }

    const {campaignId} = req.params;
    const {isMaster} = await campaignMembersRepository.obterPermissao(
      campaignId,
      req.user.id,
    );

    if (!isMaster) {
      return res.status(403).json({
        message: "Apenas o mestre da campanha pode adicionar jogadores.",
      });
    }

    const data = addCampaignMemberSchema.parse(req.body);

    let targetUserId = data.userId;
    if (!targetUserId && data.email) {
      const user = await usersRepository.buscarPorEmail(data.email);
      if (!user) {
        return res
          .status(404)
          .json({message: `Nenhum usuário com o e-mail "${data.email}" foi encontrado.`});
      }
      targetUserId = user.id;
    }

    if (!targetUserId) {
      return res.status(400).json({message: "Informe um usuário válido."});
    }

    const existing = await campaignMembersRepository.obterPermissao(
      campaignId,
      targetUserId,
    );

    if (existing.isMember) {
      return res
        .status(409)
        .json({message: "Este jogador já está participando desta campanha."});
    }

    const member = await campaignMembersRepository.adicionar(
      campaignId,
      targetUserId,
      data.role,
      req.user.id,
    );

    return res.status(201).json(member);
  },

  atualizar: async (
    req: Request<{campaignId: string; memberId: string}>,
    res: Response,
  ) => {
    if (!req.user) {
      return res.status(401).json({message: "Não autenticado."});
    }

    const {campaignId, memberId} = req.params;
    const {isMaster, campaign} =
      await campaignMembersRepository.obterPermissao(
        campaignId,
        req.user.id,
      );

    if (!isMaster) {
      return res.status(403).json({
        message: "Apenas o mestre pode alterar o papel de um jogador.",
      });
    }

    const member = await campaignMembersRepository.buscarPorId(memberId);
    if (!member || member.campaignId !== campaignId) {
      return res.status(404).json({message: "Jogador não encontrado na mesa."});
    }

    if (campaign && member.userId === campaign.ownerId) {
      return res.status(400).json({
        message: "O dono da mesa não pode ter seu papel alterado.",
      });
    }

    const data = updateCampaignMemberSchema.parse(req.body);

    const updated = await campaignMembersRepository.atualizarRole(
      memberId,
      data.role,
      req.user.id,
      campaignId,
    );

    return res.status(200).json(updated);
  },

  remover: async (
    req: Request<{campaignId: string; memberId: string}>,
    res: Response,
  ) => {
    if (!req.user) {
      return res.status(401).json({message: "Não autenticado."});
    }

    const {campaignId, memberId} = req.params;
    const {isMaster, campaign} =
      await campaignMembersRepository.obterPermissao(
        campaignId,
        req.user.id,
      );

    const member = await campaignMembersRepository.buscarPorId(memberId);
    if (!member || member.campaignId !== campaignId) {
      return res.status(404).json({message: "Jogador não encontrado na mesa."});
    }

    // Apenas mestre pode remover outros; jogador pode remover a si mesmo (sair da mesa)
    const isSelf = member.userId === req.user.id;
    if (!isMaster && !isSelf) {
      return res.status(403).json({
        message: "Você não tem permissão para remover este jogador.",
      });
    }

    if (campaign && member.userId === campaign.ownerId) {
      return res.status(400).json({
        message: "O criador da mesa não pode ser removido.",
      });
    }

    await campaignMembersRepository.remover(memberId, req.user.id, campaignId);

    return res.status(204).send();
  },
};
