/* Category definitions and fallback sample data. */
SBK.CATS = [
 {key:"announcements",   page:"announcements.html",  label:"Announcements",                          short:"Announcements",  single:"Announcement",  alias:[],                                      icon:"📢", color:"#b8860b", desc:"Notices and advisories for the public."},
 {key:"ordinances",      page:"ordinances.html",     label:"Approved Ordinances",                    short:"Ordinances",     single:"Ordinance",     alias:["Ordinances"],                          icon:"📜", color:"#12284c", desc:"Local laws enacted by the Sangguniang Bayan."},
 {key:"resolutions",     page:"resolutions.html",    label:"Approved Resolutions",                   short:"Resolutions",    single:"Resolution",    alias:["Resolutions"],                         icon:"🖋️", color:"#1d6a96", desc:"Formal expressions of the body's decisions."},
 {key:"publications",    page:"publications.html",   label:"Publications",                           short:"Publications",   single:"Publication",   alias:[],                                      icon:"📰", color:"#5b4a9a", desc:"Official publications and legal notices."},
 {key:"contractsAndMOA", page:"contracts-moa.html",  label:"Contracts and Memorandum of Agreements", short:"Contracts & MOA",single:"Contract / MOA",alias:["Contracts and MOA","MOA","Contracts"], icon:"🤝", color:"#2f7d5b", desc:"Copies of signed contracts and MOAs."},
 {key:"publicHearings",  page:"public-hearings.html",label:"Subject for Public Hearing",             short:"Public Hearings",single:"Public Hearing",alias:["Public Hearings","Public Hearing"],    icon:"🏛️", color:"#a33b3b", desc:"Measures open for public hearing."},
 {key:"updates",         page:"updates.html",        label:"Sangguniang Bayan Updates",              short:"SB Updates",     single:"Update",        alias:["Updates","SB Updates"],                icon:"🗞️", color:"#4a6275", desc:"Activities, meetings, and accomplishments."}
];

(function(){
  function s(title,number,date,desc){return [{title:"SAMPLE: "+title,number:number,date:date,year:date.slice(0,4),description:desc,fileUrl:"",imageUrl:"",featured:false}];}
  SBK.FALLBACK_DATA = {
    announcements:   s("Regular Session Schedule","","2026-11-03","Sample placeholder announcement."),
    ordinances:      s("An Ordinance (title to be replaced)","Ordinance No. 2026-001","2026-10-20","Sample placeholder ordinance."),
    resolutions:     s("A Resolution (title to be replaced)","Resolution No. 2026-001","2026-10-27","Sample placeholder resolution."),
    publications:    s("Published Notice","","2026-09-15","Sample placeholder publication."),
    contractsAndMOA: s("Memorandum of Agreement","MOA No. 2026-001","2026-08-12","Sample placeholder MOA."),
    publicHearings:  s("Public Hearing on a Proposed Measure","Hearing No. 2026-001","2026-11-05","Sample placeholder hearing notice."),
    updates:         s("Sangguniang Bayan Holds Regular Session","","2026-11-01","Sample placeholder news item.")
  };
})();
