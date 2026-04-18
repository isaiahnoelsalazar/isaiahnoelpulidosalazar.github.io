/* Topbar */
var topbar=new ECTopbar("EC Demo");
var stBtn=new ECButton("Menu",{variant:"outline"});
topbar.addAction(stBtn);
document.getElementById("topbar-mount").appendChild(topbar.element);

/* Sidebar */
var sidebar=new ECSidebar("Navigation");
function buildNav(dark){
  var lc=dark?"#89b4fa":"#1a73e8",bc=dark?"#2a2a4a":"#eee";
  var nav=document.createElement("nav"); nav.style.cssText="display:flex;flex-direction:column;";
  ["Home","Components","Themes","Docs"].forEach(function(lbl,i,arr){
    var a=document.createElement("a"); a.href="#"; a.textContent=lbl;
    a.style.cssText="color:"+lc+";text-decoration:none;font-size:14px;padding:10px 0;"+(i<arr.length-1?"border-bottom:1px solid "+bc+";":"");
    nav.appendChild(a);
  });
  return nav;
}
sidebar.setContent(buildNav(false));
document.getElementById("sidebar-mount").appendChild(sidebar.element);
stBtn.onClick(function(){ sidebar.open(); });

/* Modal */
var modal=new ECModal("Welcome to ECElements");
modal.setContent("<p style='margin:0 0 10px;font-size:15px;'>This modal starts <strong>closed</strong>.</p><p style='margin:0;font-size:14px;color:#555;'>modal.open() shows it, modal.close() hides it.</p>");
modal.addFooterButton("Cancel",function(){ modal.close(); },"outline");
modal.addFooterButton("Got it!",function(){ modal.close(); });
document.getElementById("modal-mount").appendChild(modal.element);

/* Themes */
[["Blue",ECTheme.Blue],["Green",ECTheme.Green],["Red",ECTheme.Red],["Purple",ECTheme.Purple],["Orange",ECTheme.Orange]].forEach(function(p){
  var b=new ECButton(p[0]); b.setTheme(p[1]);
  document.getElementById("theme-demo-row").appendChild(b.element);
});

/* Buttons */
var bRow=document.getElementById("btn-demo-row");
var fb=new ECButton("Filled"); fb.onClick(function(){ new ECToast("Clicked!",{type:"info"}).show(); });
var ob=new ECButton("Outline",{variant:"outline"});
var mb=new ECButton("Open Modal"); mb.onClick(function(){ modal.open(); });
var db=new ECButton("Disabled"); db.disable();
[fb,ob,mb,db].forEach(function(b){ bRow.appendChild(b.element); });

/* Toast */
var tRow=document.getElementById("toast-demo-row");
[{l:"Info",t:"info",m:"Some information."},{l:"Success",t:"success",m:"Action completed!"},{l:"Warning",t:"warning",m:"Watch out!"},{l:"Error",t:"error",m:"Something failed."}].forEach(function(x){
  var b=new ECButton(x.l); var c={info:"#1a73e8",success:"#2e7d32",warning:"#e65100",error:"#c62828"}[x.t];
  b.element.style.background=c; b.element.style.color="#fff";
  b.onClick(function(){ new ECToast(x.m,{type:x.t,duration:2500}).show(); });
  tRow.appendChild(b.element);
});

/* Sidebar buttons */
var sdRow=document.getElementById("sidebar-demo-row");
var osb=new ECButton("Open Sidebar"); osb.onClick(function(){ sidebar.setTheme(ECTheme.Blue).disableDarkMode(); sidebar.setContent(buildNav(false)); sidebar.open(); });
var dsb=new ECButton("Dark Sidebar"); dsb.onClick(function(){ sidebar.setTheme(ECTheme.Dark).enableDarkMode(); sidebar.setContent(buildNav(true)); sidebar.open(); });
sdRow.appendChild(osb.element); sdRow.appendChild(dsb.element);

/* Form */
var fc=document.getElementById("form-demo");
fc.appendChild(new ECTextbox({label:"Your name",placeholder:"Jane Doe"}).element);
var dd=new ECDropdown({label:"Framework",items:[{value:"vanilla",label:"Vanilla JS"},{value:"react",label:"React"},{value:"vue",label:"Vue"},{value:"svelte",label:"Svelte"}]});
dd.onChange(function(v){ new ECToast("Picked: "+v,{type:"info",duration:2000}).show(); });
fc.appendChild(dd.element);
var rw=document.createElement("div"); rw.style.cssText="display:flex;flex-direction:column;gap:4px;";
var rlbl=document.createElement("label"); rlbl.className="ec-textbox-label ec-component ec-light"; rlbl.textContent="Plan";
var radio=new ECRadio("plan",[{value:"free",label:"Free",checked:true},{value:"pro",label:"Pro"},{value:"team",label:"Team"}]);
rw.appendChild(rlbl); rw.appendChild(radio.element); fc.appendChild(rw);
var tw=document.createElement("div"); tw.style.cssText="display:flex;flex-direction:column;gap:12px;justify-content:center;";
var tog=new ECToggle("Notifications",false); tog.onChange(function(on){ new ECToast("Notifications "+(on?"ON":"OFF"),{type:on?"success":"warning",duration:1500}).show(); });
var chk=new ECCheckbox("I agree to the terms");
tw.appendChild(tog.element); tw.appendChild(chk.element); fc.appendChild(tw);

/* Badges */
var br=document.getElementById("badge-demo-row");
var bl={default:"Default",primary:"Primary",success:"Active",warning:"Pending",danger:"Blocked",info:"Info"};
["default","primary","success","warning","danger","info"].forEach(function(t){ br.appendChild(new ECBadge(bl[t],t).element); });

/* Dark mode */
var dr=document.getElementById("dark-demo-row");
var dkb=new ECButton("Dark Button"); dkb.setTheme(ECTheme.Dark).enableDarkMode();
var dkm=new ECModal("Dark Modal"); dkm.setContent("<p style='margin:0'>Dark themed modal.</p>");
dkm.addFooterButton("Close",function(){ dkm.close(); },"outline");
dkm.setTheme(ECTheme.Dark).enableDarkMode(); document.body.appendChild(dkm.element);
var odmb=new ECButton("Open Dark Modal"); odmb.setTheme(ECTheme.Dark).enableDarkMode(); odmb.onClick(function(){ dkm.open(); });
dr.appendChild(dkb.element); dr.appendChild(odmb.element);

/* Accordion */
var acc=new ECAccordion({items:[
  {title:"What is ECElements?",content:"<p style='margin:0;font-size:14px;'>A zero-dependency component library. Two script tags and you're ready.</p>"},
  {title:"Does it need a build step?",content:"<p style='margin:0;font-size:14px;'>No build step. ECStyleSheet handles CSS dynamically.</p>"},
  {title:"Can I use dark mode?",content:"<p style='margin:0;font-size:14px;'>Yes. Every component has enableDarkMode() and ECTheme.Dark.</p>"},
  {title:"Is it free?",content:"<p style='margin:0;font-size:14px;'>Completely free for any project.</p>"},
]});
document.getElementById("accordion-demo").appendChild(acc.element);

/* List */
var ld=document.getElementById("list-demo");
var bl2=new ECList({variant:"bordered"});
["Dashboard","Settings","Profile","Logout"].forEach(function(s){ bl2.addItem(s,function(){ new ECToast("Clicked: "+s,{type:"info",duration:1500}).show(); }); });
var bw=document.createElement("div"); bw.style.cssText="flex:1;min-width:140px;";
var blbl=document.createElement("p"); blbl.style.cssText="margin:0 0 6px;font-size:12px;color:#888;font-weight:500;"; blbl.textContent="Bordered";
bw.appendChild(blbl); bw.appendChild(bl2.element); ld.appendChild(bw);
var sl2=new ECList({variant:"striped"});
["React","Vue","Svelte","Angular"].forEach(function(f){ sl2.addItem(f); });
var sw=document.createElement("div"); sw.style.cssText="flex:1;min-width:140px;";
var slbl=document.createElement("p"); slbl.style.cssText="margin:0 0 6px;font-size:12px;color:#888;font-weight:500;"; slbl.textContent="Striped";
sw.appendChild(slbl); sw.appendChild(sl2.element); ld.appendChild(sw);
var hl=new ECList({direction:"horizontal",variant:"hoverable"});
["Home","Blog","About","Contact"].forEach(function(s){ hl.addItem(s); });
var hw=document.createElement("div"); hw.style.cssText="flex:2;min-width:200px;";
var hlbl=document.createElement("p"); hlbl.style.cssText="margin:0 0 6px;font-size:12px;color:#888;font-weight:500;"; hlbl.textContent="Horizontal";
hw.appendChild(hlbl); hw.appendChild(hl.element); ld.appendChild(hw);

/* Breadcrumbs */
document.getElementById("breadcrumb-demo").appendChild(new ECBreadcrumbs([{label:"Home",href:"#"},{label:"Settings",href:"#"},{label:"Profile"}]).element);

/* Stepper */
var stepper=new ECStepper(["Account","Details","Payment","Confirm"],1);
document.getElementById("stepper-demo").appendChild(stepper.element);
var sbr=document.getElementById("stepper-btns");
var spb=new ECButton("Back",{variant:"outline"}); spb.onClick(function(){ stepper.prev(); });
var snb=new ECButton("Next"); snb.onClick(function(){ stepper.next(); });
sbr.appendChild(spb.element); sbr.appendChild(snb.element);

/* Divider */
var dv=document.getElementById("divider-demo");
var dp0=document.createElement("p"); dp0.style.cssText="margin:0;font-size:14px;color:#555;"; dp0.textContent="Plain:";
dv.appendChild(dp0); dv.appendChild(new ECDivider().element);
dv.appendChild(new ECDivider({label:"or continue with"}).element);
var dp2=document.createElement("p"); dp2.style.cssText="margin:0;font-size:14px;color:#555;"; dp2.textContent="Dashed + thick:";
dv.appendChild(dp2); dv.appendChild(new ECDivider({dashed:true,thick:true}).element);

/* Progress */
var pd=document.getElementById("progress-demo");
var bar1=new ECProgressBar({label:"Upload",value:65}); pd.appendChild(bar1.element);
var bar2=new ECProgressBar({label:"Storage",value:82}); bar2.setTheme(ECTheme.Red); bar2.setHeight(12); pd.appendChild(bar2.element);
var bar3=new ECProgressBar({label:"Tasks",value:30}); bar3.setTheme(ECTheme.Green); pd.appendChild(bar3.element);
var pv=65; setInterval(function(){ pv=pv>=100?0:pv+1; bar1.setValue(pv); },80);

/* Spinner */
var spd=document.getElementById("spinner-demo");
var s1=new ECSpinner({size:"sm"}),s2=new ECSpinner(),s3=new ECSpinner({size:"lg"});
var s4=new ECSpinner(); s4.setTheme(ECTheme.Red);
var s5=new ECSpinner(); s5.setTheme(ECTheme.Green);
[[s1,"sm"],[s2,"default"],[s3,"lg"],[s4,"red"],[s5,"green"]].forEach(function(p){
  var w=document.createElement("div"); w.style.cssText="display:flex;flex-direction:column;align-items:center;gap:6px;";
  var l=document.createElement("span"); l.style.cssText="font-size:12px;color:#888;"; l.textContent=p[1];
  w.appendChild(p[0].element); w.appendChild(l); spd.appendChild(w);
});

/* Tooltip */
var td=document.getElementById("tooltip-demo");
var tsb=new ECButton("Save"),tdb=new ECButton("Delete"),tib=new ECButton("?",{variant:"outline"});
tdb.setTheme(ECTheme.Red); tib.element.style.width="36px";
td.appendChild(new ECTooltip(tsb,"Saves your work").element);
td.appendChild(new ECTooltip(tdb,"Permanently deletes this item").element);
td.appendChild(new ECTooltip(tib,"Click for more information").element);

/* Popup */
var ppd=document.getElementById("popup-demo");
var pb1=new ECButton("Options"); var pop1=new ECPopup(pb1);
pop1.setWidth(180);
pop1.setContent("<div style='display:flex;flex-direction:column;gap:2px;'>"
  +"<button onclick=\"new ECToast('Edit',{type:'info',duration:1500}).show()\" style='background:none;border:none;text-align:left;padding:8px 10px;font-size:14px;cursor:pointer;border-radius:6px;width:100%;'>Edit</button>"
  +"<button onclick=\"new ECToast('Duplicate',{type:'info',duration:1500}).show()\" style='background:none;border:none;text-align:left;padding:8px 10px;font-size:14px;cursor:pointer;border-radius:6px;width:100%;'>Duplicate</button>"
  +"<hr style='margin:4px 0;border:none;border-top:1px solid #eee;'>"
  +"<button onclick=\"new ECToast('Deleted!',{type:'error',duration:1500}).show()\" style='background:none;border:none;text-align:left;padding:8px 10px;font-size:14px;cursor:pointer;border-radius:6px;color:#c62828;width:100%;'>Delete</button>"
  +"</div>");
ppd.appendChild(pop1.element);
var pb2=new ECButton("Profile",{variant:"outline"}); var pop2=new ECPopup(pb2);
pop2.setWidth(200);
pop2.setContent("<div style='padding:4px 0;'>"
  +"<p style='margin:0 0 4px;font-size:13px;font-weight:600;'>Jane Doe</p>"
  +"<p style='margin:0 0 10px;font-size:12px;color:#888;'>jane@example.com</p>"
  +"<hr style='margin:0 0 8px;border:none;border-top:1px solid #eee;'>"
  +"<button style='background:none;border:none;text-align:left;padding:6px 0;font-size:13px;cursor:pointer;width:100%;color:#1a73e8;'>Account Settings</button><br>"
  +"<button style='background:none;border:none;text-align:left;padding:6px 0;font-size:13px;cursor:pointer;width:100%;color:#c62828;'>Sign Out</button>"
  +"</div>");
ppd.appendChild(pop2.element);

/* DataTable */
var people=[
  {name:"Alice Chen",  role:"Admin", dept:"Engineering",status:"Active",  joined:"2021-03"},
  {name:"Bob Martin",  role:"Editor",dept:"Marketing",  status:"Active",  joined:"2020-11"},
  {name:"Carol White", role:"Viewer",dept:"Design",     status:"Inactive",joined:"2022-01"},
  {name:"David Kim",   role:"Admin", dept:"Engineering",status:"Active",  joined:"2019-06"},
  {name:"Eva Lopez",   role:"Editor",dept:"Sales",      status:"Active",  joined:"2023-02"},
  {name:"Frank Hall",  role:"Viewer",dept:"HR",         status:"Inactive",joined:"2021-08"},
  {name:"Grace Lee",   role:"Editor",dept:"Marketing",  status:"Active",  joined:"2022-09"},
  {name:"Henry Park",  role:"Admin", dept:"Engineering",status:"Active",  joined:"2020-04"},
  {name:"Iris Nguyen", role:"Viewer",dept:"Design",     status:"Inactive",joined:"2023-05"},
  {name:"Jack Brown",  role:"Editor",dept:"Sales",      status:"Active",  joined:"2021-12"},
  {name:"Karen Clark", role:"Admin", dept:"HR",         status:"Active",  joined:"2019-03"},
  {name:"Leo Turner",  role:"Viewer",dept:"Engineering",status:"Active",  joined:"2022-07"},
];
var dtable=new ECDataTable({
  columns:[
    {key:"name",  label:"Name"},
    {key:"role",  label:"Role"},
    {key:"dept",  label:"Department"},
    {key:"joined",label:"Joined"},
    {key:"status",label:"Status",sortable:false,render:function(v){
      var c=v==="Active"?"#2e7d32":"#888",b=v==="Active"?"#e6f4ea":"#f0f0f0";
      return '<span style="display:inline-block;padding:2px 10px;border-radius:999px;font-size:12px;font-weight:500;background:'+b+';color:'+c+'">'+v+'</span>';
    }},
  ],
  data:people, pageSize:5,
});
document.getElementById("datatable-demo").appendChild(dtable.element);

/* Slider */
var sdemo=document.getElementById("slider-demo");
var vs=new ECSlider({label:"Volume",min:0,max:100,value:60,suffix:"%",ticks:["0%","25%","50%","75%","100%"]});
vs.onChange(function(v){ new ECToast("Volume: "+v+"%",{type:"info",duration:900}).show(); });
var ps=new ECSlider({label:"Max Price",min:0,max:1000,step:50,value:400,suffix:"$",ticks:["$0","$250","$500","$750","$1000"]});
ps.setTheme(ECTheme.Green);
var bs=new ECSlider({label:"Brightness",min:0,max:10,value:7});
bs.setTheme(ECTheme.Orange);
[vs,ps,bs].forEach(function(s){ sdemo.appendChild(s.element); });

/* DatePicker */
var dpdemo=document.getElementById("datepicker-demo");
var dp1=new ECDatePicker({label:"Start date"});
dp1.onChange(function(iso){ new ECToast("Selected: "+iso,{type:"success",duration:2000}).show(); });
var dp2=new ECDatePicker({label:"End date"}); dp2.setValue("2025-12-31");
[dp1,dp2].forEach(function(dp){
  var w=document.createElement("div"); w.style.cssText="width:220px;";
  w.appendChild(dp.element); dpdemo.appendChild(w);
});

/* FileUpload */
var upl=new ECFileUpload({accept:".pdf,.png,.jpg,.jpeg",multiple:true,maxSize:5*1024*1024,title:"Drag & Drop files here",subtitle:"PDF, PNG, JPG up to 5 MB"});
upl.onChange(function(files){ if(files.length) new ECToast(files.length+" file(s) selected",{type:"info",duration:1500}).show(); });
document.getElementById("fileupload-demo").appendChild(upl.element);

/* Rating */
var rdemo=document.getElementById("rating-demo");
var r1=new ECRating({value:3}); r1.onChange(function(v){ new ECToast(v?"Rated "+v+" stars!":"Rating cleared",{type:v?"success":"info",duration:1500}).show(); });
var r2=new ECRating({value:4,readonly:true});
var r3=new ECRating({value:0,max:10});
var rcol=document.createElement("div"); rcol.style.cssText="display:flex;flex-direction:column;gap:14px;";
var r2r=document.createElement("div"); r2r.style.cssText="display:flex;align-items:center;gap:8px;";
var r2l=document.createElement("span"); r2l.style.cssText="font-size:12px;color:#888;"; r2l.textContent="(read-only)";
r2r.appendChild(r2.element); r2r.appendChild(r2l);
var r3r=document.createElement("div"); r3r.style.cssText="display:flex;align-items:center;gap:8px;flex-wrap:wrap;";
var r3l=document.createElement("span"); r3l.style.cssText="font-size:12px;color:#888;"; r3l.textContent="(out of 10)";
r3r.appendChild(r3.element); r3r.appendChild(r3l);
rcol.appendChild(r1.element); rcol.appendChild(r2r); rcol.appendChild(r3r);
rdemo.appendChild(rcol);

/* Card */
var cdemo=document.getElementById("card-demo");
var c1=new ECMediaCard({author:"Jane Doe",timestamp:"2 hours ago",
  content:"<p style='margin:0'>Just shipped ECMediaCard! Supports author headers, images, and footer actions. Give it a like!</p>",
  actions:[
    {icon:"👍",label:"Like",   onClick:function(){ new ECToast("Liked!",  {type:"success",duration:1200}).show(); }},
    {icon:"💬",label:"Comment",onClick:function(){ new ECToast("Comment!",{type:"info",duration:1200}).show(); }},
    {icon:"↗️",label:"Share", onClick:function(){ new ECToast("Shared!", {type:"info",duration:1200}).show(); }},
  ]});
c1.setWidth(300); cdemo.appendChild(c1.element);
var c2=new ECMediaCard({author:"Dev Team",timestamp:"Yesterday",
  imageSrc:"https://picsum.photos/seed/ecmediacard2/600/200",imageHeight:"160px",
  content:"<p style='margin:0;font-size:14px;'>ECMediaCard also supports an image above the body content — great for articles or product cards.</p>",
  actions:[{icon:"❤️",label:"Favorite",onClick:function(){ new ECToast("Favorited!",{type:"success",duration:1200}).show(); }}]});
c2.setWidth(300); cdemo.appendChild(c2.element);

/* Hero */
var hero=new ECHero({
  eyebrow:"Zero dependencies · Pure JS",
  title:"Build UIs without the overhead",
  subtitle:"ECElements gives you production-ready components with a single script tag. No build step, no npm, no config.",
  background:"linear-gradient(135deg,#e8f0fe 0%,#fce4ec 100%)",
  actions:[
    {label:"Get Started",onClick:function(){ new ECToast("Let's go!",{type:"success",duration:2000}).show(); }},
    {label:"View on GitHub",variant:"outline",onClick:function(){ new ECToast("Opening GitHub...",{type:"info",duration:1500}).show(); }},
  ],
});
document.getElementById("hero-demo").appendChild(hero.element);

/* TreeView */
var treeData = [
  { label: "Documents", expanded: true, children: [
    { label: "Projects", expanded: true, children: [
      { label: "ECElements" },
      { label: "ECStyleSheet" }
    ]},
    { label: "Invoices", children: [{ label: "2025" }, { label: "2026" }] }
  ]},
  { label: "Downloads" }
];
var tree = new ECTreeView(treeData);
document.getElementById("treeview-demo").appendChild(tree.element);

/* Avatar & Indicator */
var avContainer = document.getElementById("avatar-indicator-demo");
var av1 = new ECAvatar({ initials: "JD", size: "48px" });
var ind1 = new ECIndicator(av1, { type: "online" });
var av2 = new ECAvatar({ initials: "AB", src: "https://picsum.photos/seed/avatar2/100/100", size: "48px" });
var ind2 = new ECIndicator(av2, { type: "notification" });
var av3 = new ECAvatar({ initials: "X", src: "invalid-url-to-trigger-fallback.jpg", size: "48px" }); 
avContainer.appendChild(ind1.element);
avContainer.appendChild(ind2.element);
avContainer.appendChild(av3.element);

/* Lightbox */
var lb = new ECLightbox();
var lbThumb = document.createElement("img");
lbThumb.src = "https://picsum.photos/seed/lb/150/100";
lbThumb.style.cssText = "cursor:pointer; border-radius:8px; box-shadow:0 2px 8px rgba(0,0,0,0.1);";
lbThumb.addEventListener("click", function() {
  lb.open("https://picsum.photos/seed/lb/800/600", "A beautiful landscape image.");
});
document.getElementById("lightbox-demo").appendChild(lbThumb);

/* Carousel */
var carItems = [];
for (var i = 1; i <= 5; i++) {
  var slide = document.createElement("img");
  slide.src = "https://picsum.photos/seed/car" + i + "/400/250";
  slide.style.cssText = "width:100%; border-radius:12px; display:block;";
  carItems.push(slide);
}
var carousel = new ECCarousel(carItems);
document.getElementById("carousel-demo").appendChild(carousel.element);

/* Banner */
var bdemo = document.getElementById("banner-demo");
var b1 = new ECBanner("Server maintenance is scheduled for Sunday at 2:00 AM UTC.");
var b2 = new ECBanner("⚡ 50% OFF FLASH SALE ⚡ USE CODE: ECELEMENTS", { loop: true });
b2.setTheme(ECTheme.Red);
bdemo.appendChild(b1.element);
bdemo.appendChild(b2.element);

/* Countdown */
var targetDate = new Date();
targetDate.setDate(targetDate.getDate() + 3); // 3 days from now
targetDate.setHours(targetDate.getHours() + 5); 
var timer = new ECCountdown(targetDate);
document.getElementById("countdown-demo").appendChild(timer.element);

/* Grid */
var grid = new ECGrid({ columns: 2, gap: "16px" });
for (var i = 1; i <= 2; i++) {
  var gCard = new ECMediaCard({
    author: "User " + i,
    content: "<p style='margin:0'>Grid item " + i + "</p>"
  });
  grid.addItem(gCard);
}
document.getElementById("grid-demo").appendChild(grid.element);

/* Drawer */
var drawer = new ECDrawer("Settings");
drawer.setContent("<div style='padding:10px 0;'><p>Configure your preferences below.</p><div id='drawer-opts'></div></div>");
var dBtn = new ECButton("Open Bottom Drawer");
dBtn.onClick(function() { drawer.open(); });
document.getElementById("drawer-demo").appendChild(dBtn.element);
document.body.appendChild(drawer.element);

// Add some toggles to the drawer for effect
setTimeout(function() {
  var dopts = document.getElementById('drawer-opts');
  dopts.appendChild(new ECToggle("Dark Mode", false).element);
  dopts.appendChild(document.createElement("br"));
  dopts.appendChild(document.createElement("br"));
  dopts.appendChild(new ECToggle("Push Notifications", true).element);
}, 100);