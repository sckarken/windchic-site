(()=>{'use strict';
const $=(s,p=document)=>p.querySelector(s),$$=(s,p=document)=>[...p.querySelectorAll(s)];
const key='windchic-language';
// Editorial crossfade carousel, manually navigable, pauses when tab is hidden or user is interacting
const slides=$$('.hero-slide');if(slides.length){let current=0,timer;const progress=$('.slide-progress i');function show(n){current=(n+slides.length)%slides.length;slides.forEach((x,i)=>{x.classList.toggle('is-active',i===current);x.setAttribute('aria-hidden',String(i!==current))});if($('.hero-index'))$('.hero-index').innerHTML=String(current+1).padStart(2,'0')+' <span>/ '+String(slides.length).padStart(2,'0')+'</span>';if(progress){progress.style.animation='none';void progress.offsetWidth;progress.style.animation='progress 8s linear infinite'}}function start(){clearInterval(timer);if(!document.hidden&&!matchMedia('(prefers-reduced-motion: reduce)').matches)timer=setInterval(()=>show(current+1),8000)}$('.hero-next')?.addEventListener('click',()=>{show(current+1);start()});$('.hero-prev')?.addEventListener('click',()=>{show(current-1);start()});document.addEventListener('visibilitychange',start);show(0);start()}
// Contemporary Atelier is the permanent WINDCHIC typographic system.
document.body.classList.add('font-atelier');
// Translation table for editorial website text. Language persists between actual HTML pages.
const T={
'Home':['Accueil','首页'],'About us':['À propos','关于我们'],'Services':['Services','服务'],'Projects':['Projets','项目'],'Blog':['Journal','博客'],'Contact':['Contact','联系'],
'You define.':['Vous définissez.','您提出需求。'],'We tailor.':['Nous adaptons.','我们量身定制。'],'We coordinate.':['Nous coordonnons.','我们统筹协调。'],'We deliver.':['Nous concrétisons.','我们落实交付。'],
'AN INDEPENDENT CROSS-BORDER STUDIO':['UN STUDIO INTERNATIONAL INDÉPENDANT','独立跨境服务工作室'],
'EUROPE & ASIA':['EUROPE & ASIE','欧洲与亚洲'],
'Thoughtful solutions for exhibitions, events, sourcing and business operations — shaped around every brief.':['Des solutions sur mesure pour vos salons, événements, approvisionnements et opérations professionnelles.','面向展会、活动、采购与商务落地的定制解决方案。'],
'SCROLL TO EXPLORE':['DÉFILER POUR EXPLORER','向下探索'],'01 / OUR PERSPECTIVE':['01 / NOTRE REGARD','01 / 我们的理念'],
'Different needs.':['Chaque projet diffère.','不同的需求。'],'One way forward.':['Une solution adaptée.','同一个目标。'],
'We turn a complex brief into a carefully managed operation. From the first supplier conversation to the last detail on site, WINDCHIC brings clarity, resourcefulness and a considered sense of service to every project.':['Nous transformons les demandes complexes en opérations maîtrisées. De la première recherche de prestataire au dernier détail sur le terrain, WINDCHIC associe précision, ingéniosité et sens du service.','我们将复杂需求转化为有序执行的项目。从供应商沟通到现场交付，WINDCHIC 将严谨、灵活与周到服务贯穿始终。'],
'Discover the studio':['Découvrir le studio','了解我们'],'02 / OUR PRACTICE':['02 / NOS MÉTIERS','02 / 专业服务'],
'What we':['Ce que nous','我们可以'],'make possible.':['rendons possible.','为您实现。'],'All services':['Tous nos services','全部服务'],
'Exhibitions & Events':['Salons & événements','展会与活动'],'Stands, activations, people and production.':['Stands, animations, équipes et production.','展台、品牌活动、人员与制作。'],
'Specialist Equipment':['Matériel spécialisé','专业设备'],'Technical sourcing, rental and installation.':['Recherche, location et installation technique.','专业设备寻源、租赁与安装。'],
'Business Concierge':['Conciergerie d’affaires','商务礼宾'],'Hospitality, teams, transport and fieldwork.':['Accueil, équipes, transport et opérations terrain.','接待、团队、交通与现场执行。'],
'China & Europe Sourcing':['Sourcing Chine & Europe','中欧采购寻源'],'Manufacturers, quotations and procurement support.':['Fabricants, comparaison des devis et achats.','制造商筛选、报价比较与采购协调。'],
'03 / SELECTED FIELD NOTES':['03 / EXEMPLES TERRAIN','03 / 项目实践'],'Every detail':['Chaque détail','每一个细节'],'has a purpose.':['compte.','都至关重要。'],
'Real-world briefs. Measurable constraints. Solutions shaped around the situation.':['Des demandes concrètes, des contraintes précises et une réponse adaptée à chaque situation.','真实需求、明确限制、量身制定的解决方案。'],
'Explore projects':['Voir nos projets','探索项目'],'04 / ON THE GROUND':['04 / SUR LE TERRAIN','04 / 现场实践'],
'A few':['Quelques','一些'],'examples.':['réalisations.','案例。'],'View project index':['Voir tous les projets','查看全部项目'],
'Two containers. Ten people. Four days.':['Deux conteneurs. Dix personnes. Quatre jours.','两个集装箱、十名工人、四天。'],
'Ten screens. One precise brief.':['Dix écrans. Un cahier des charges précis.','十台触摸屏，一份精准需求。'],
'05 / AN OPEN CONVERSATION':['05 / PARLONS DE VOTRE PROJET','05 / 欢迎咨询'],
'Great projects start':['Les beaux projets commencent','出色的项目始于'],'with':['avec','从'],'a clear brief.':['une demande claire.','清晰需求。'],
'Tell us yours':['Parlez-nous du vôtre','告诉我们您的需求'],
'THE NEXT PROJECT STARTS HERE':['VOTRE PROCHAIN PROJET COMMENCE ICI','下一个项目由此开始'],
'Let’s make it':['Ensemble,','让我们一起'],'happen.':['concrétisons-le.','实现目标。'],'Start a conversation':['Échanger avec nous','开始沟通'],
'REACH US DIRECTLY':['CONTACT DIRECT','直接联系'],'Call us':['Appelez-nous','致电我们'],'Copy WeChat ID ⧉':['Copier l’identifiant WeChat ⧉','复制微信号 ⧉'],
'PROJECT REQUEST':['DEMANDE DE PROJET','项目咨询'],'Define your':['Définissez votre','介绍您的'],'project.':['projet.','项目。'],
'A short guided brief. Nothing is booked or confirmed by submitting this request.':['Un court formulaire pour préciser vos besoins. Aucun engagement n’est pris sans validation.','填写简要项目需求。提交表单不代表预订或确认。'],
'Project category':['Type de projet','项目类型'],'City or country':['Ville ou pays','城市或国家'],'Brief description':['Description du besoin','需求简介'],
'Continue':['Continuer','继续'],'Target timeline':['Délai souhaité','期望时间'],'Specific event date (optional)':['Date de l’événement (facultative)','活动日期（可选）'],
'Indicative budget (optional)':['Budget estimatif (facultatif)','预算范围（可选）'],'Your name':['Votre nom','您的姓名'],'Company (optional)':['Entreprise (facultatif)','公司（可选）'],
'Prepare my enquiry ↗':['Préparer ma demande ↗','生成咨询内容 ↗'],
'Send by email ↗':['Envoyer par email ↗','通过邮件发送 ↗'],'Copy brief ⧉':['Copier le brief ⧉','复制需求内容 ⧉'],
'Your brief is ready.':['Votre demande est prête.','您的需求已准备好。'],
'Tell us what':['Parlez-nous de','告诉我们'],'you have in mind.':['votre projet.','您的想法。'],
'When is it happening?':['Quel est votre calendrier ?','项目计划何时开展？'],
};
Object.assign(T,{"Select a project type": ["Choisissez un type de projet", "请选择项目类别"], "Get in touch": ["Nous contacter", "联系我们"], "Our projects": ["Nos projets", "我们的项目"], "Projects we have worked on": ["Nos projets et expériences", "项目与经验"], "Our story": ["Notre histoire", "我们的故事"], "About us": ["À propos", "关于我们"], "Our services": ["Nos services", "我们的服务"], "Exhibition operations": ["Opérations salons", "展会执行"], "Exhibitions": ["Salons", "展会"], "Events": ["Événements", "活动"], "Sourcing": ["Sourcing", "采购寻源"], "On the ground": ["Sur le terrain", "现场执行"], "Completed": ["Réalisé", "已完成"], "In progress": ["En cours", "进行中"], "Team experience": ["Expérience de l’équipe", "团队经验"], "Planning": ["En préparation", "筹备中"], "All projects": ["Tous les projets", "全部项目"], "Tell us about your project": ["Parlez-nous de votre projet", "介绍您的项目"], "The studio": ["Le studio", "工作室"], "Read more": ["En savoir plus", "了解更多"], "Explore": ["Découvrir", "探索"], "Your company": ["Votre entreprise", "您的公司"], "What we do": ["Ce que nous faisons", "我们的服务"], "Field notes": ["Carnet de terrain", "项目笔记"], "From brief to delivery.": ["De la demande à l’exécution.", "从需求到交付。"], "Suppliers, compared.": ["Prestataires comparés.", "供应商对比。"], "Projects, coordinated.": ["Projets coordonnés.", "项目协调。"], "On-site, delivered.": ["Exécution sur place.", "现场交付。"]});
const initial=new WeakMap();function translate(lang){document.documentElement.lang=lang==='zh'?'zh-CN':lang;document.documentElement.dataset.language=lang;$$('[data-lang]').forEach(b=>{b.classList.toggle('active',b.dataset.lang===lang);b.setAttribute('aria-pressed',String(b.dataset.lang===lang))});const ix=lang==='fr'?0:1;const walker=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);let node;while(node=walker.nextNode()){if(node.parentElement?.closest('script,style,pre,textarea,select,option'))continue;if(!initial.has(node))initial.set(node,node.textContent);let original=initial.get(node),trim=original.trim();if(!trim||!T[trim])continue;let trans=lang==='en'?trim:T[trim][ix];node.textContent=original.replace(trim,trans)}try{localStorage.setItem(key,lang)}catch(_){}}$$('[data-lang]').forEach(x=>x.addEventListener('click',()=>translate(x.dataset.lang)));let remembered='en';try{remembered=localStorage.getItem(key)||'en'}catch(_){}translate(remembered);
})();
