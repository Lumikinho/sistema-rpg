import type {Request, Response} from "express";

import {campaignMembersRepository} from "../repositories/campaign-members.repositorie.js";
import {templatesRepository} from "../repositories/templates.repositorie.js";

export const templatesController = {
  buscarOuCriar: async (
    req: Request<{campaignId: string}>,
    res: Response,
  ) => {
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

    const template = await templatesRepository.garantirTemplatePadrao(
      campaignId,
      req.user.id,
    );

    return res.status(200).json(template);
  },
};
