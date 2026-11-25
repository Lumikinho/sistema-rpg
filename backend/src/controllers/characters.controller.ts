import type {Request, Response} from "express";

import {campaignMembersRepository} from "../repositories/campaign-members.repositorie.js";
import {charactersRepository} from "../repositories/characters.repositorie.js";
import {templatesRepository} from "../repositories/templates.repositorie.js";
import {
  assignCharacterSchema,
  createCharacterSchema,
  updateCharacterSchema,
} from "../schemas/characters.schema.js";

export const charactersController = {
  listar: async (req: Request<{campaignId: string}>, res: Response) => {
    if (!req.user) {
      return res.status(401).json({message: "Não autenticado."});
    }

    const {campaignId} = req.params;
    const {isMember, isMaster} =
      await campaignMembersRepository.obterPermissao(
        campaignId,
        req.user.id,
      );

    if (!isMember) {
      return res
        .status(403)
        .json({message: "Você não tem acesso a esta campanha."});
    }

    const characters =
      await charactersRepository.listarPorCampanha(campaignId);

    const charactersWithPermissions = characters.map((char) => {
      const isOwner = char.ownerId === req.user?.id;
      const canEdit = isMaster || (isOwner && !char.isLocked);
      return {
        ...char,
        canEdit,
        isMine: isOwner,
      };
    });

    return res.status(200).json(charactersWithPermissions);
  },

  buscarPorId: async (
    req: Request<{campaignId: string; characterId: string}>,
    res: Response,
  ) => {
    if (!req.user) {
      return res.status(401).json({message: "Não autenticado."});
    }

    const {campaignId, characterId} = req.params;
    const {isMember, isMaster} =
      await campaignMembersRepository.obterPermissao(
        campaignId,
        req.user.id,
      );

    if (!isMember) {
      return res
        .status(403)
        .json({message: "Você não tem acesso a esta campanha."});
    }

    const character = await charactersRepository.buscarPorId(
      characterId,
      campaignId,
    );

    if (!character) {
      return res.status(404).json({message: "Ficha não encontrada."});
    }

    const isOwner = character.ownerId === req.user.id;
    const canEdit = isMaster || (isOwner && !character.isLocked);

    return res.status(200).json({
      ...character,
      canEdit,
      isMine: isOwner,
    });
  },

  criar: async (req: Request<{campaignId: string}>, res: Response) => {
    if (!req.user) {
      return res.status(401).json({message: "Não autenticado."});
    }

    const {campaignId} = req.params;
    const {isMember, isMaster} =
      await campaignMembersRepository.obterPermissao(
        campaignId,
        req.user.id,
      );

    if (!isMember) {
      return res
        .status(403)
        .json({message: "Você não tem acesso a esta campanha."});
    }

    const data = createCharacterSchema.parse(req.body);

    // Se o usuário for jogador comum (não mestre), força a ficha a ser dele e do tipo PLAYER
    if (!isMaster) {
      data.ownerId = req.user.id;
      data.type = "PLAYER";
    }

    // Se um ownerId foi passado, verifica se ele pertence à campanha
    if (data.ownerId) {
      const ownerPerm = await campaignMembersRepository.obterPermissao(
        campaignId,
        data.ownerId,
      );
      if (!ownerPerm.isMember) {
        return res
          .status(400)
          .json({message: "O jogador indicado não faz parte desta campanha."});
      }
    }

    // Garante que o template existe
    const template = await templatesRepository.garantirTemplatePadrao(
      campaignId,
      req.user.id,
    );

    const versionId = template.publishedVersionId ?? template.versions[0]?.id;
    if (!versionId) {
      return res
        .status(500)
        .json({message: "Não foi possível obter a versão ativa do modelo de ficha."});
    }

    // Inicializa campos padrão do modelo
    const defaultData: Record<string, any> = {};
    const publishedVersion =
      template.publishedVersion ?? template.versions[0];
    if (publishedVersion && publishedVersion.fields) {
      for (const f of publishedVersion.fields) {
        if (f.defaultValue !== null && f.defaultValue !== undefined) {
          defaultData[f.key] = f.defaultValue;
        }
      }
    }

    // Mescla dados iniciais
    const initialSheetData = {
      ...defaultData,
      ...data.sheetData,
      nome: data.name,
    };

    const character = await charactersRepository.criar(
      campaignId,
      req.user.id,
      template.id,
      versionId,
      {
        ...data,
        sheetData: initialSheetData,
      },
    );

    return res.status(201).json({
      ...character,
      canEdit: true,
      isMine: character.ownerId === req.user.id,
    });
  },

  atualizar: async (
    req: Request<{campaignId: string; characterId: string}>,
    res: Response,
  ) => {
    if (!req.user) {
      return res.status(401).json({message: "Não autenticado."});
    }

    const {campaignId, characterId} = req.params;
    const {isMember, isMaster} =
      await campaignMembersRepository.obterPermissao(
        campaignId,
        req.user.id,
      );

    if (!isMember) {
      return res
        .status(403)
        .json({message: "Você não tem acesso a esta campanha."});
    }

    const character = await charactersRepository.buscarPorId(
      characterId,
      campaignId,
    );

    if (!character) {
      return res.status(404).json({message: "Ficha não encontrada."});
    }

    const isOwner = character.ownerId === req.user.id;
    const canEdit = isMaster || (isOwner && !character.isLocked);

    if (!canEdit) {
      return res.status(403).json({
        message: character.isLocked
          ? "Esta ficha está bloqueada pelo mestre e não pode ser editada."
          : "Você não tem permissão para editar esta ficha.",
      });
    }

    const data = updateCharacterSchema.parse(req.body);

    // Jogadores não podem alterar bloqueio nem reatribuir dono
    if (!isMaster) {
      delete data.ownerId;
      delete data.isLocked;
      delete data.type;
    }

    if (data.ownerId) {
      const ownerPerm = await campaignMembersRepository.obterPermissao(
        campaignId,
        data.ownerId,
      );
      if (!ownerPerm.isMember) {
        return res
          .status(400)
          .json({message: "O jogador indicado não faz parte desta campanha."});
      }
    }

    // Se o nome foi atualizado, sincroniza em sheetData.nome
    if (data.name && data.sheetData) {
      data.sheetData.nome = data.name;
    }

    const updated = await charactersRepository.atualizar(
      characterId,
      campaignId,
      req.user.id,
      data,
    );

    return res.status(200).json({
      ...updated,
      canEdit: isMaster || (updated?.ownerId === req.user.id && !updated?.isLocked),
      isMine: updated?.ownerId === req.user.id,
    });
  },

  excluir: async (
    req: Request<{campaignId: string; characterId: string}>,
    res: Response,
  ) => {
    if (!req.user) {
      return res.status(401).json({message: "Não autenticado."});
    }

    const {campaignId, characterId} = req.params;
    const {isMember, isMaster} =
      await campaignMembersRepository.obterPermissao(
        campaignId,
        req.user.id,
      );

    if (!isMember) {
      return res
        .status(403)
        .json({message: "Você não tem acesso a esta campanha."});
    }

    const character = await charactersRepository.buscarPorId(
      characterId,
      campaignId,
    );

    if (!character) {
      return res.status(404).json({message: "Ficha não encontrada."});
    }

    const isOwner = character.ownerId === req.user.id;
    const canDelete = isMaster || (isOwner && !character.isLocked);

    if (!canDelete) {
      return res.status(403).json({
        message: "Você não tem permissão para excluir esta ficha.",
      });
    }

    await charactersRepository.excluir(characterId, campaignId, req.user.id);

    return res.status(204).send();
  },

  atribuir: async (
    req: Request<{campaignId: string; characterId: string}>,
    res: Response,
  ) => {
    if (!req.user) {
      return res.status(401).json({message: "Não autenticado."});
    }

    const {campaignId, characterId} = req.params;
    const {isMaster} = await campaignMembersRepository.obterPermissao(
      campaignId,
      req.user.id,
    );

    if (!isMaster) {
      return res.status(403).json({
        message: "Apenas o mestre pode alterar o jogador de uma ficha.",
      });
    }

    const data = assignCharacterSchema.parse(req.body);

    if (data.ownerId) {
      const targetPerm = await campaignMembersRepository.obterPermissao(
        campaignId,
        data.ownerId,
      );
      if (!targetPerm.isMember) {
        return res
          .status(400)
          .json({message: "O jogador indicado não faz parte desta campanha."});
      }
    }

    const updated = await charactersRepository.atribuirDono(
      characterId,
      campaignId,
      data.ownerId,
      req.user.id,
    );

    return res.status(200).json(updated);
  },
};
