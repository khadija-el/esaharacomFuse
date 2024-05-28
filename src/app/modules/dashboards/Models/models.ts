import { DateTime } from "luxon";

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
    name = 'khadija';
    tel = '06151515';
    adresse = '';
  }

  export class Livraison {
    id = 0;
    numero = 'khadija';
    date = DateTime.now;
    montantHt = '';
    montantTTC = '';
    tva = '';
    idclient=''
  }
  export class Detail {
    id = 0;
    numero = '';
    qte = 1;
    prix = 0;
    montantHT = 0;
    montantTTC = 0;
    tva = 0;
    article: Article;
    idArticle = null;
    idLivraison=null;
    livraison:Livraison
  }
