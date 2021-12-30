import { createStore } from "vuex";

import Axios from "axios";
const DB = Axios.create({
   baseURL: "http://localhost:3000/api",
});
DB.interceptors.request.use((config) => {
   const token = localStorage.getItem("token");
   config.headers.Authorization = "Bearer " + token;
   return config;
});

const DEFAULT_REDIRECT_TIME = 3;

const store = createStore({
   state: {
      server: {
         serverResponseType: "",
         serverResponseMessage: "",
      },
      global: {
         isLoading: true,
         timeToRedirection: DEFAULT_REDIRECT_TIME,
      },
      postView: {
         post: null,
         viewer: null,
         postCreationDate: null,
      },
      allPosts: [],
      createdPost: null,
   },
   mutations: {
      //Modifie la liste des postes
      setAllPosts(state, data) {
         state.allPosts = data.posts;
         state.global.isLoading = data.loadingState;
      },

      //Modifie le post dans le store
      setPost(state, data) {
         state.postView.post = data.post;
         state.postView.viewer = data.viewer;
         state.postView.postCreationDate = data.date;
         state.global.isLoading = data.loadingState;
      },

      //Défini le post nouvellement créé
      setCreatedPost(state, data) {
         state.createdPost = data.postId;
      },

      //Supprime l'index du post récemment créé
      resetCreatedPost(state) {
         state.createdPost = null;
      },

      //Modifie la réponse serveur dans le store
      updateServerResponse(state, data) {
         state.server.serverResponseType = data.type;
         state.server.serverResponseMessage = data.message;
      },

      //Reset le temps de redirection dans le store
      resetTimeToRedirect(state) {
         state.global.timeToRedirection = DEFAULT_REDIRECT_TIME;
      },

      //Décrémente le temps de redirection dans le store
      decreaseTimeToRedirect(state) {
         state.global.timeToRedirection--;
      },

      //Reset l'etat de chargement
      resetLoadingState(state) {
         state.global.isLoading = true;
      },
   },

   actions: {
      //Récupère tous les posts
      getAllPosts({ commit }) {
         commit("resetLoadingState");
         DB.get("posts").then((response) => {
            let data = {
               posts: response.data,
               loadingState: false,
            };
            commit("setAllPosts", data);
         });
      },

      //Charge un post pour la page de détails d'un partage
      loadPost({ commit }, id) {
         commit("resetLoadingState");
         DB.get(`/posts/${id}/details`).then((response) => {
            let creationDate = new Date(response.data.post.createdAt);
            let newDate = `publié le ${creationDate.toLocaleString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" })}`;
            let data = {
               post: response.data.post,
               viewer: response.data.viewer,
               date: newDate,
               loadingState: false,
            };
            commit("setPost", data);
         });
      },

      //Crée un partage
      createPost({ commit, getters }, payload) {
         let data = new FormData();
         data.append("title", payload.title);
         data.append("description", payload.description);
         data.append("image", payload.file);
         DB.post("posts/create", data)
            .then((response) => {
               commit("setCreatedPost", response.data);
               let timeToRedirect = getters.getTimeToRedirect;
               let serverInfo = {
                  type: "alert-success",
                  message: `Votre partage a bien été publié ! Vous serez redirigé(e) dans ${timeToRedirect} secondes.`,
               };
               commit("updateServerResponse", serverInfo);
            })
            .catch(() => {
               let serverInfo = {
                  type: "alert-danger",
                  message: `Un problème est survenu lors du traitement de votre requête !`,
               };
               commit("updateServerResponse", serverInfo);
            });
      },

      //Met à jour un post
      updatePost({ dispatch, getters, commit }, payload) {
         commit("resetTimeToRedirect");
         DB.put("posts/update", payload)
            .then(() => {
               dispatch("loadPost", payload.id);
               let timeToRedirect = getters.getTimeToRedirect;
               let data = {
                  type: "alert-success",
                  message: `Votre partage a bien été publié ! Vous serez redirigé(e) dans ${timeToRedirect} secondes.`,
               };
               commit("updateServerResponse", data);
            })
            .catch(() => {
               let data = {
                  type: "alert-danger",
                  message: `Un problème est survenu lors du traitement de votre requête !`,
               };
               commit("updateServerResponse", data);
            });
      },

      //Supprime un post
      deletePost({ commit, dispatch }, payload) {
         commit("resetLoadingState");
         DB.delete("posts/delete", { data: payload }).then(() => {
            dispatch("getAllPosts");
            console.log("Post supprimé !");
         });
      },
   },
   getters: {
      //Récupère le temps de redirection
      getTimeToRedirect(state) {
         return state.global.timeToRedirection;
      },
   },
});

export default store;
