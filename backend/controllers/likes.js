//Import des modules
const Models = require("../models");

//Ajout d'un like
exports.switch = (request, response) => {
   Models.Like.findOne({
      where: {
         PostId: request.body.postId,
         UserId: response.locals.userId,
      },
   })
      .then((like) => {
         if (like) {
            Models.Like.update(
               {
                  likeState: !like.likeState,
               },
               {
                  where: {
                     id: like.id,
                  },
               }
            )
               .then(() => {
                  response.status(200).json({
                     message: "Like modifié !",
                  });
               })
               .catch((error) => {
                  response.status(500).json(error);
               });
         } else {
            Models.Post.findOne({
               where: {
                  id: request.body.postId,
               },
            }).then((post) => {
               if (post) {
                  Models.Like.create({
                     UserId: response.locals.userId,
                     PostId: post.id,
                     likeState: true,
                  })
                     .then(() => {
                        response.status(200).json({
                           message: "Like ajouté !",
                        });
                     })
                     .catch((error) => {
                        response.status(500).json(error);
                     });
               } else {
                  response.status(404).json({
                     message: "Post introuvable !",
                  });
               }
            });
         }
      })
      .catch((error) => {
         response.status(500).json(error);
      });
};
