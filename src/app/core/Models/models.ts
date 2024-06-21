export class Article {
    id = 0;
    reference = 'article1';
    designation = 'article une';
    StockInitial = 10;
    stockFinal = 10;
    qteAchete = 10;
    qteVendue = 10;
    prixAchat_HT = 10;
    prixAchat_TTC = 10;
    prixVente_HT = 10;
    prixVente_TTC =100;
    info = 'yujfyuyf';
  }
  export class Client {
    id = 0;
    name = 'khadija';
    tel = '06151515';
    adresse = '';
  }
  export class User {
    id = 0;
    prenom = '';
    nom = '';
    password = '';
    email = '';
    imageUrl = '';
    metadata = '';
    isActive = true;
    idRole = 0;
    // role: Role;
  }
  export class Livraison {
    id = 0;
    numero = '';
    actif = true;
    dateCreation = new Date();
    info = '';
    montantHT = 0;
    tva = 20;
    montantTTC = 0;
    client: Client;
    idClient = null;
    childs: DetailLivraison[] = [];

  }
  export class DetailLivraison {
    id = 0;
    numero = '';
    designation = '';
    qte = 1;
    prixUnitaireHT = 0;
    remiseHT = 0;
    montantHT = 0;
    prixUnitaireTTC = 0;
    remise_TTC = 0;
    montantTTC = 0;
    tva = 0;
    // livraisonClient: LivraisonClient;
    idLivraison: number = null;
    article: Article;
    idArticle = null;
  }
