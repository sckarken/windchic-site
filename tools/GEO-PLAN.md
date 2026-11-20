# Plan GEO WINDCHIC : être cité par les IA (ChatGPT, Claude, Perplexity, Gemini, DeepSeek, Kimi, Doubao, Qwen, Yuanbao)

*Version du 20 novembre 2026*

## 1. Comment une IA décide de vous citer (à comprendre avant tout)

Quand quelqu'un demande à une IA « 在欧洲办活动找哪家公司？ », elle répond de deux façons :

1. **Avec sa mémoire.** Elle a appris sur le web jusqu'à une certaine date. WINDCHIC est récent : vous n'êtes probablement pas dans sa mémoire, et vous n'y entrerez qu'au prochain entraînement, si on parle assez de vous en ligne.
2. **Avec une recherche web en direct.** C'est le cas de ChatGPT Search, Perplexity, Gemini, Kimi, Doubao, Yuanbao et DeepSeek en mode recherche. **C'est là que vous pouvez gagner vite.** L'IA lance une recherche, lit les 5 à 20 premières pages et cite celles qui répondent clairement à la question.

Pour être cité, il faut donc trois choses :

- **Être indexé** par les moteurs que ces IA utilisent : Google, Bing, Baidu, Sogou, ainsi que les index propres de ByteDance et Alibaba.
- **Répondre clairement** à la question posée : une phrase directe, des faits, des noms de villes, des chiffres.
- **Être mentionné ailleurs que sur votre propre site.** C'est le facteur le plus fort, surtout en Chine.

**Ce qu'il faut savoir pour la Chine.** D'après ce qu'on observe, les IA chinoises citent surtout des plateformes chinoises plutôt que des sites étrangers :

- **Yuanbao (Tencent)** cite surtout les articles de comptes officiels WeChat (公众号).
- **Doubao (ByteDance)** cite surtout Toutiao et Douyin.
- **Baidu / Ernie** cite surtout Baidu Baike et Baijiahao.
- **DeepSeek et Kimi** citent souvent Zhihu.

**Votre site seul ne suffira pas pour les IA chinoises.** Il sert de source officielle, mais le volume doit venir de ces plateformes. C'est une tendance observée, pas une règle publiée par ces entreprises : on le vérifiera avec les tests de la section 5.

## 2. Ce qui est déjà fait sur le site (20 novembre 2026)

| Élément | À quoi ça sert |
|---|---|
| **Page FAQ en 3 langues** (`/faq.html`, `/zh/faq.html`, `/fr/faq.html`), 13 questions | C'est le format que les IA reprennent le plus : une question, une réponse directe. Les questions chinoises sont formulées comme on les pose à DeepSeek, pas traduites mot à mot |
| **Données structurées (JSON-LD) sur toutes les pages** | Elles disent aux moteurs et aux IA, dans un format machine, qui vous êtes : entreprise, fondateurs, langues, pays couverts, services, contact, WeChat. Elles contiennent aussi la FAQ |
| **`llms.txt` et `llms-full.txt`** | Une fiche texte de présentation destinée aux IA, en EN, ZH et FR, générée automatiquement à partir du site |
| **`robots.txt`** | Autorise explicitement les robots des IA occidentales et chinoises (Baidu, ByteDance, Sogou, 360, Shenma/Quark, Huawei, Zhipu) |
| **Titres et descriptions chinois réécrits** | Ils reprennent les mots que tapent les Chinois : 出海, 落地执行, 海外参展, 商务考察 |
| **Mots-clés `meta` en chinois** | Encore lus par Baidu, 360 et Sogou |
| **Polices Google non bloquantes, sans police chinoise Google** | Google est bloqué en Chine : avant, la page pouvait rester blanche plusieurs secondes pour un visiteur chinois |
| **Bouton flottant WeChat sur la version chinoise** (à la place de WhatsApp) | Conseil de l'appel : WhatsApp ne marche pas en Chine |
| **Sitemap avec dates** et **clé IndexNow** | Les moteurs voient plus vite les mises à jour |

**À faire relire par Wenjing :** la FAQ chinoise (`tools/content.py`, bloc `FAQ`) et les nouveaux titres chinois (fin de `tools/content.py`).

## 3. Ce que vous devez faire vous-mêmes (je ne peux pas le faire à votre place)

### Semaine 1 : se faire indexer (environ 2 h au total)
1. **Google Search Console** (search.google.com/search-console) : ajouter `windchic.com`, valider par DNS, soumettre `https://windchic.com/sitemap.xml`. Google alimente Gemini et une partie de ChatGPT.
2. **Bing Webmaster Tools** (bing.com/webmasters) : importer depuis Google Search Console en un clic. Bing alimente Copilot, une partie de ChatGPT Search et DuckDuckGo. Ensuite, lancer `python3 tools/indexnow.py` après chaque mise en ligne.
3. **Baidu 搜索资源平台** (ziyuan.baidu.com) : Wenjing crée le compte (il faut un numéro chinois), ajoute le site et soumet le sitemap. Baidu indexe les sites étrangers, mais lentement. Envoyez-moi le code de validation : je l'ajouterai au site.
4. **Sogou** (zhanzhang.sogou.com) et **360** (zhanzhang.so.com) : même chose, 10 minutes chacun. Sogou appartient à Tencent.

### Semaine 1 : tester l'accès depuis la Chine
Le site est hébergé sur GitHub Pages, qui est **parfois lent ou bloqué en Chine**. Demandez à une personne en Chine (par exemple un des deux prospecteurs) d'ouvrir `windchic.com/zh/` en 4G, sans VPN, et de chronométrer. Vous pouvez aussi tester gratuitement sur boce.com ou 17ce.com.
- **Si le site met moins de 3 secondes à s'afficher :** rien à faire.
- **Si c'est lent ou bloqué :** il faudra un hébergement à Hong Kong ou un CDN accessible en Chine. Une licence ICP n'est pas possible sans société chinoise. On en reparle le cas échéant.

### Mois 1 à 3 : exister sur les plateformes chinoises (le plus important pour les IA chinoises)
Par ordre de priorité :

1. **Compte officiel WeChat (公众号), type « 订阅号 ».** Une entité étrangère peut s'inscrire, mais la vérification se fait au cas par cas et peut être payante : à vérifier avec Wenjing. Publiez **2 articles par mois**, en reprenant les études de cas (DJI Ségovie, délégation Carrefour, Piscine Global) et les notes du Journal. C'est la source principale de Yuanbao, et WeChat est déjà votre canal de contact.
2. **Zhihu (知乎).** Wenjing répond à de vraies questions existantes : « 去法国参展需要注意什么 », « 欧洲商务考察怎么安排 ». Elle donne une réponse utile et détaillée, puis mentionne WINDCHIC en une ligne à la fin. **Pas de publicité pure** : Zhihu la supprime et les IA ne la citent pas. Visez **4 réponses par mois**. DeepSeek et Kimi citent beaucoup Zhihu.
3. **Xiaohongshu (小红书).** C'est le contenu « coulisses » et « réalisations » des 4 piliers évoqués pendant l'appel. Plus utile pour la prospection que pour les IA.
4. **Toutiao (头条号) / Baijiahao (百家号).** Republiez les mêmes articles que sur le compte WeChat : c'est gratuit, ça prend 10 minutes, et ça nourrit Doubao et Baidu.
5. **Baidu Baike (百度百科).** C'est très difficile pour une petite entreprise sans couverture presse. À garder pour plus tard.

**Règle d'or : un même contenu, publié sur plusieurs plateformes.** Un article = une version WeChat, une version Toutiao/Baijiahao, une réponse Zhihu adaptée et un post Xiaohongshu illustré. L'IA peut produire les déclinaisons. Wenjing valide.

### Mois 1 à 3 : côté occidental
- **Une page LinkedIn entreprise WINDCHIC**, plus les profils de Théo et Wenjing à jour avec un lien vers le site.
- **Des mentions par vos partenaires** : demandez à SB Service, Glamcamp, KKD et aux autres de vous citer avec un lien (page références, post LinkedIn). Une mention sur un site tiers vaut plus que dix pages sur le vôtre.
- **Les annuaires du secteur** : Business France, la CCI France Chine et les annuaires de prestataires des salons où vous travaillez (Piscine Global, MWC).

### À me renvoyer pour que je l'intègre au site
- Le **nom chinois** de la marque, une fois validé par Wenjing : à mettre dans `CN_NAME`, dans `tools/build.py`.
- Les **liens des profils officiels** (compte WeChat, Xiaohongshu, LinkedIn, Zhihu) : à mettre dans `SAME_AS`. Ça permet aux IA de relier tous ces comptes à la même entreprise.
- Les **codes de validation** Baidu, Sogou et 360.

## 4. Contenu du site à ajouter ensuite (par ordre d'impact)
1. **Une page par étude de cas** au lieu d'un bloc dans « Réalisations ». Une IA cite une URL précise, pas une page à onglets.
2. **Des pages « ville × service »**, mais seulement là où vous avez une vraie expérience : « 法国展会落地服务 », « 巴塞罗那 MWC 参展差旅 », « 里昂 Piscine Global 展台活动 » ». Pas de pages vides générées en masse : c'est pénalisé et ça ne trompe pas les IA.
3. **Ouvrir les notes du Journal** : aujourd'hui, le texte est caché dans un bloc dépliable. Une vraie page par note est mieux indexée.

## 5. Mesurer : le test mensuel (30 minutes, le 1er de chaque mois)

Posez ces questions dans DeepSeek (mode recherche activé), Kimi, Doubao, Yuanbao, Qwen, ChatGPT, Perplexity et Gemini. Notez dans un tableau si WINDCHIC est **cité**, **cité avec lien** ou **absent**, et quels concurrents apparaissent.

**En chinois :**
1. 在欧洲办活动，有没有懂中文、能全程对接的执行公司？
2. 中国企业去法国参展，有哪些公司提供落地服务？
3. 去法国商务考察，谁可以帮忙安排企业参观和翻译？
4. 在西班牙办活动需要租触摸屏，找哪家公司？
5. 巴塞罗那 MWC 参展，酒店和差旅谁可以帮忙安排？
6. WINDCHIC 是什么公司？（vérifie que l'IA vous décrit correctement）

**En anglais / français :**
7. Chinese-speaking event agency in France
8. Who can organise a Chinese business delegation visit in France?
9. Agence événementielle sinophone en Europe
10. What is WINDCHIC? / Qu'est-ce que WINDCHIC ?

**Objectifs réalistes :**
- **À 1 mois :** la question 6 et la question 10 donnent une description correcte dans Perplexity et ChatGPT Search, une fois le site indexé.
- **À 3 mois :** WINDCHIC est cité sur 2 ou 3 des questions générales dans au moins une IA occidentale et une IA chinoise.
- **À 6 mois :** si vous n'êtes cité sur aucune question générale en chinois, c'est que la présence sur WeChat et Zhihu est insuffisante. Ce sera la première chose à renforcer.

**Ce qui compte vraiment : les demandes de contact qui disent « je vous ai trouvé via ChatGPT / DeepSeek ».** Ajoutez la question « Comment nous avez-vous connus ? » à chaque premier échange.

## 6. Rappel de priorité (cohérent avec l'appel)
Le GEO est un investissement à 3 à 6 mois. **Il ne remplace pas la prospection directe**, qui reste la source des premiers clients. Comptez au maximum 2 à 3 heures par semaine sur le GEO et le contenu, le reste sur la prospection.
