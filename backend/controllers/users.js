//Inclusion de la config
const config = require("../config/config.json");

//Inclusion des modules
const Models = require("../models");
const Bcrypt = require("bcryptjs");
const FileSystem = require("fs");
const Jimp = require("jimp");

//Récupération du profil
exports.getProfile = (_request, response) => {
    Models.User.findOne({
        attributes: ["name", "avatar", "createdAt", "isadmin"],
        where: {
            id: response.locals.userId
        }
    }).then(result => {
        response.status(200).json(result);
    }).catch(error => {
        response.status(404).json(error);
    });
}

//Execution de la route
exports.updateProfile = (request, response) => {
    Models.User.findOne({
        attributes: ["avatar"],
        where: {
            id: response.locals.userId
        }
    }).then(user => {
        const img = user.avatar.split("/images/avatars/")[1];
        if (img != "defaultAvatar.png") {
            FileSystem.unlink(`images/avatars/${img}`, () => {
                console.log(`Image ${img} supprimée des resources...`);
            });
        }
        Jimp.read(`./images/avatars/${request.file.filename}`).then(output => {
            output.cover(config.jimp.avatarWidth, config.jimp.avatarWidth).write(`./images/avatars/${request.file.filename}`);
            Models.User.update({
                name: request.body.name,
                avatar: `${request.protocol}://${request.get("host")}/images/avatars/${request.file.filename}`
            }, {
                where: {
                    id: response.locals.userId
                }
            }).then(() => {
                response.status(200).json({
                    message: "Informations mises à jour avec succès !"
                });
            }).catch(error => {
                response.status(500).json(error);
            });
        }).catch(() => {
            response.status(500).json({
                message: "Un problème est survenu lors du traitement de votre avatar, votre profil n'a pas été mis à jour."
            });
        });
    }).catch(() => {
        response.status(404).json({
            message: "Utilisateur introuvable !"
        });
    });
}

//Suppression du profil
exports.deleteProfile = (_request, response) => {
    Models.User.findOne({
        attributes: ["avatar"],
        where: {
            id: response.locals.userId
        }
    }).then(user => {
        const img = user.avatar.split("/images/avatars/")[1];
        if (img != "defaultAvatar.png") {
            FileSystem.unlink(`images/avatars/${img}`, () => {
                console.log(`Image ${img} supprimée des resources...`);
            });
        }
        Models.User.destroy({
            where: {
                id: response.locals.userId
            }
        }).then(() => {
            response.status(200).json({
                message: "Votre compte a bien été supprimé !"
            });
        }).catch(error => {
            response.status(500).json(error);
        });
    }).catch(() => {
        response.status(404).json({
            message: "Utilisateur introuvable !"
        });
    })
}

//Change user password
exports.changePassword = (request, response) => {
    Models.User.findOne({
        attributes: ["password"],
        where: {
            id: response.locals.userId
        }
    }).then(result => {
        Bcrypt.compare(request.body.currPassword, result.password).then(valid => {
            if (valid) {
                Bcrypt.hash(request.body.newPassword, config.bcrypt.saltrounds).then(hash => {
                    Models.User.update({
                        password: hash
                    }, {
                        where: {
                            id: response.locals.userId
                        }
                    }).then(() => {
                        response.status(200).json({
                            message: "Mot de passe modifié avec succès"
                        });
                    }).catch(error => {
                        response.status(500).json(error);
                    });
                }).catch(error => {
                    response.status(500).json(error);
                });
            } else {
                response.status(500).json({
                    message: "Mot de passe incorrect !"
                });
            }
        })
    }).catch(() => {
        response.status(404).json({
            message: "Ce compte n'existe pas !"
        });
    });
}