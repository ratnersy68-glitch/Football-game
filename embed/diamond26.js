var mu=Object.defineProperty;var gu=(i,t,e)=>t in i?mu(i,t,{enumerable:!0,configurable:!0,writable:!0,value:e}):i[t]=e;var I=(i,t,e)=>gu(i,typeof t!="symbol"?t+"":t,e);(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const s of document.querySelectorAll('link[rel="modulepreload"]'))n(s);new MutationObserver(s=>{for(const r of s)if(r.type==="childList")for(const a of r.addedNodes)a.tagName==="LINK"&&a.rel==="modulepreload"&&n(a)}).observe(document,{childList:!0,subtree:!0});function e(s){const r={};return s.integrity&&(r.integrity=s.integrity),s.referrerPolicy&&(r.referrerPolicy=s.referrerPolicy),s.crossOrigin==="use-credentials"?r.credentials="include":s.crossOrigin==="anonymous"?r.credentials="omit":r.credentials="same-origin",r}function n(s){if(s.ep)return;s.ep=!0;const r=e(s);fetch(s.href,r)}})();const vu=["ROOKIE","MINORS","VETERAN","ALL-STAR","HALL OF FAME","LEGEND"],Ml={pitchSpeed:"auto",fieldingAssist:!0,runningAssist:!0,showStrikeZone:!0,cameraShake:!0,volume:.8,crowdVolume:.5},Su={hitters:[["Jackson Holliday",7,"2B","L","R",66,58,70,70,68,66,"SS"],["Gunnar Henderson",2,"SS","L","R",78,82,72,74,74,80,"3B"],["Adley Rutschman",35,"C","S","R",72,64,82,35,78,68,"1B"],["Ryan Mountcastle",6,"1B","R","R",72,68,50,35,55,55],["Samuel Basallo",15,"DH","L","R",64,78,60,35,55,80,"C,1B"],["Jordan Westburg",11,"3B","R","R",72,66,58,60,70,72,"2B"],["Tyler O'Neill",9,"RF","R","R",56,76,58,52,62,72,"LF"],["Colton Cowser",17,"LF","L","R",60,70,66,62,70,72,"CF,RF"],["Dylan Beavers",4,"CF","L","R",60,58,66,66,68,66,"RF,LF"],["Coby Mayo",1,"3B","R","R",58,72,56,40,55,70,"1B"],["Gary Sánchez",24,"C","R","R",52,70,52,25,60,78,"1B"],["Jeremiah Jackson",73,"2B","R","R",60,56,50,66,62,66,"SS,LF,RF"],["Emmanuel Rivera",30,"3B","R","R",62,50,50,40,66,70,"1B"]],pitchers:[["Trevor Rogers",28,"SP","L",92,70,72,80,"FF,SI,CH,SL"],["Kyle Bradish",38,"SP","R",95,64,82,70,"SI,FF,SL,CU,CH"],["Dean Kremer",64,"SP","R",94,64,70,82,"FF,FC,FS,CU,SI"],["Zach Eflin",24,"SP","R",92,82,66,70,"SI,FF,CU,FC,CH"],["Cade Povich",37,"SP","L",92,58,66,70,"FF,CU,SL,CH"],["Félix Bautista",74,"CL","R",100,54,88,30,"FF,FS"],["Keegan Akin",45,"RP","L",94,64,66,35,"FF,SL,CH"],["Tyler Wells",68,"RP","R",94,70,68,50,"FF,CH,SL,CU"],["Shawn Dubin",66,"RP","R",95,58,72,35,"FF,SL,CU,CH"],["Yaramil Hiraldo",39,"RP","R",96,54,72,30,"FF,FS,SL"]]},xu={hitters:[["Jarren Duran",16,"LF","L","R",72,66,58,88,70,66,"CF"],["Roman Anthony",48,"RF","L","R",70,70,80,66,64,70,"LF,CF"],["Alex Bregman",2,"3B","R","R",74,68,80,45,78,70],["Trevor Story",10,"SS","R","R",64,66,52,72,72,76],["Wilyer Abreu",52,"DH","L","L",64,70,62,55,76,82,"RF"],["Romy González",23,"1B","R","R",66,58,48,55,62,62,"2B,3B"],["Ceddanne Rafaela",43,"CF","R","R",64,58,40,76,92,80,"2B,SS"],["Carlos Narváez",75,"C","R","R",62,56,62,30,78,74],["Kristian Campbell",4,"2B","R","R",64,58,66,58,55,60,"LF,1B"],["Masataka Yoshida",7,"DH","L","R",74,56,74,40,45,50,"LF"],["Connor Wong",12,"C","R","R",56,50,50,52,70,70],["Nick Sogard",75,"2B","S","R",60,30,64,55,68,64,"SS,3B"],["Rob Refsnyder",30,"RF","R","R",64,52,62,40,58,60,"LF,1B"]],pitchers:[["Garrett Crochet",35,"SP","L",98,74,82,80,"FF,FC,ST,SI,CH"],["Brayan Bello",66,"SP","R",95,62,66,75,"SI,CH,FF,ST"],["Lucas Giolito",54,"SP","R",93,62,68,70,"FF,CH,SL,CU"],["Connelly Early",62,"SP","L",92,64,68,65,"FF,CU,CH,ST"],["Kutter Crawford",50,"SP","R",93,66,68,70,"FF,FC,FS,ST,SI"],["Aroldis Chapman",47,"CL","L",100,58,80,30,"FF,SI,SL,FS"],["Garrett Whitlock",22,"RP","R",95,70,72,35,"SI,CH,ST"],["Justin Slaten",63,"RP","R",96,62,72,30,"FF,CU,FC"],["Greg Weissert",57,"RP","R",94,62,70,30,"SI,ST,CH"],["Brennan Bernardino",83,"RP","L",91,60,64,30,"SI,CU,FF"]]},_u={hitters:[["Trent Grisham",12,"CF","L","L",60,66,74,58,74,60],["Aaron Judge",99,"RF","R","R",82,99,92,52,70,80,"CF"],["Cody Bellinger",35,"LF","L","L",74,72,70,62,78,70,"CF,1B"],["Ben Rice",22,"1B","L","R",66,74,70,40,60,56,"C"],["Giancarlo Stanton",27,"DH","R","R",60,92,56,20,40,60,"RF"],["Jazz Chisholm Jr.",13,"2B","L","R",64,76,58,80,72,74,"3B,CF"],["Ryan McMahon",19,"3B","L","R",60,66,64,45,80,74,"2B"],["Austin Wells",28,"C","L","R",58,68,66,32,72,64],["Anthony Volpe",11,"SS","R","R",58,60,54,72,74,78],["Jasson Domínguez",89,"LF","S","R",62,64,64,72,60,64,"CF,RF"],["J.C. Escarra",39,"C","L","R",52,48,56,30,68,66,"1B"],["José Caballero",72,"SS","R","R",58,46,60,84,72,74,"2B,3B,CF"],["Paul Goldschmidt",48,"1B","R","R",70,62,64,40,70,60]],pitchers:[["Max Fried",54,"SP","L",95,76,85,85,"FF,CU,SI,CH,SL,FC"],["Carlos Rodón",55,"SP","L",96,62,78,80,"FF,SL,CH,CU,SI"],["Gerrit Cole",45,"SP","R",97,70,82,85,"FF,SL,KC,CH,FC"],["Cam Schlittler",31,"SP","R",98,64,76,70,"FF,FC,SI,CU,ST"],["Will Warren",98,"SP","R",94,60,72,70,"SI,ST,FF,CH,CU"],["David Bednar",53,"CL","R",97,68,82,30,"FF,KC,FS"],["Luke Weaver",30,"RP","R",96,66,72,32,"FF,CH,FC,SL"],["Camilo Doval",75,"RP","R",99,54,78,30,"FC,SL,SI"],["Tim Hill",54,"RP","L",89,70,64,32,"SI,CU,FC"],["Fernando Cruz",63,"RP","R",94,58,82,30,"FS,SI,SL"]]},yu={hitters:[["Chandler Simpson",7,"CF","L","R",72,22,60,99,66,50,"LF"],["Yandy Díaz",2,"DH","R","R",78,60,82,30,60,60,"1B,3B"],["Junior Caminero",13,"3B","R","R",70,86,56,50,66,82],["Brandon Lowe",8,"2B","L","R",62,78,62,40,62,62],["Jonathan Aranda",62,"1B","L","R",74,62,70,40,60,56,"2B,3B"],["Josh Lowe",15,"RF","L","R",62,66,56,72,70,74,"LF"],["Jake Mangum",9,"LF","S","L",70,38,56,80,66,58,"CF,RF"],["Nick Fortes",4,"C","R","R",56,46,52,30,74,74],["Carson Williams",1,"SS","R","R",52,66,50,70,82,80],["Taylor Walls",6,"SS","S","R",52,38,60,70,86,76,"2B,3B"],["Christopher Morel",24,"LF","R","R",52,72,46,50,50,64,"RF,3B"],["Kameron Misner",5,"RF","L","L",56,64,62,70,70,72,"CF,LF"],["Hunter Feduccia",46,"C","L","R",52,46,66,30,68,66]],pitchers:[["Shane McClanahan",18,"SP","L",97,70,84,75,"FF,CH,SL,CU"],["Drew Rasmussen",57,"SP","R",96,74,74,65,"FF,SI,FC,ST,CU"],["Shane Baz",11,"SP","R",97,60,80,72,"FF,KC,FC,CH,SL"],["Ryan Pepiot",44,"SP","R",95,64,74,75,"FF,CH,SL,FC,CU"],["Ian Seymour",33,"SP","L",91,66,72,68,"FF,CH,SL,FC"],["Pete Fairbanks",29,"CL","R",98,60,80,30,"FF,SL"],["Griffin Jax",22,"RP","R",97,66,84,30,"ST,FF,CH"],["Garrett Cleavinger",60,"RP","L",96,62,78,30,"FF,ST,CU"],["Edwin Uceta",63,"RP","R",95,64,78,30,"FF,CH,FC"],["Kevin Kelly",49,"RP","R",89,72,70,32,"SI,ST"]]},Mu={hitters:[["George Springer",4,"DH","R","R",72,70,72,52,62,64,"RF"],["Bo Bichette",11,"SS","R","R",82,64,54,48,64,70,"2B"],["Vladimir Guerrero Jr.",27,"1B","R","R",84,82,80,30,62,66],["Alejandro Kirk",30,"C","R","R",78,52,80,15,80,66],["Addison Barger",47,"3B","L","R",62,74,56,55,70,92,"RF"],["Anthony Santander",25,"RF","S","R",56,78,56,35,50,64,"LF"],["Daulton Varsho",25,"CF","L","R",54,70,56,66,92,80,"LF"],["Nathan Lukes",38,"LF","L","R",70,44,70,60,66,62,"RF"],["Ernie Clement",22,"2B","R","R",74,44,64,50,80,72,"3B,SS"],["Andrés Giménez",0,"2B","L","R",62,46,56,72,92,78,"SS"],["Davis Schneider",36,"2B","R","R",58,62,76,50,60,62,"LF"],["Myles Straw",3,"CF","R","R",64,24,60,82,82,72,"LF,RF"],["Tyler Heineman",55,"C","S","R",64,32,64,30,70,66]],pitchers:[["Kevin Gausman",34,"SP","R",94,76,82,85,"FF,FS,SL"],["Shane Bieber",57,"SP","R",92,82,80,70,"FC,KC,FF,SL,CH"],["José Berríos",17,"SP","R",93,70,74,85,"SI,CU,FF,CH"],["Max Scherzer",31,"SP","R",93,74,76,70,"FF,SL,CH,CU,FC"],["Trey Yesavage",39,"SP","R",95,60,86,65,"FF,FS,SL"],["Jeff Hoffman",23,"CL","R",97,64,80,30,"FF,SL,FS"],["Louis Varland",37,"RP","R",97,66,74,30,"FF,KC,SL,CH"],["Seranthony Domínguez",48,"RP","R",98,54,76,30,"FF,SI,SL,CH"],["Brendon Little",54,"RP","L",92,56,78,30,"KC,SI"],["Yariel Rodríguez",29,"RP","R",94,60,72,35,"SL,FF,FS"]]},bu={hitters:[["Chase Meidroth",10,"2B","R","R",72,30,74,58,70,64,"SS,3B"],["Miguel Vargas",20,"3B","R","R",62,60,70,40,60,62,"1B,LF"],["Andrew Benintendi",23,"DH","L","L",66,58,64,40,66,58,"LF"],["Colson Montgomery",2,"SS","L","R",56,82,58,50,68,74,"3B"],["Luis Robert Jr.",88,"CF","R","R",60,72,44,74,76,70],["Lenyn Sosa",50,"1B","R","R",66,62,40,42,62,62,"2B,3B"],["Kyle Teel",8,"C","L","R",66,50,70,50,66,70],["Mike Tauchman",18,"RF","L","L",62,50,72,45,64,62,"LF,CF"],["Brooks Baldwin",27,"LF","S","R",56,50,54,64,60,64,"2B,SS,RF"],["Edgar Quero",7,"C","S","R",64,44,66,25,60,66],["Michael A. Taylor",15,"CF","R","R",46,50,42,70,82,76,"LF,RF"],["Curtis Mead",25,"3B","R","R",60,50,56,45,58,60,"2B,1B"],["Josh Rojas",9,"2B","L","R",58,42,62,55,62,64,"3B,LF"]],pitchers:[["Shane Smith",41,"SP","R",96,62,72,70,"FF,CH,SL,CU"],["Davis Martin",65,"SP","R",93,66,66,72,"FF,SL,CH,CU,FC"],["Jonathan Cannon",48,"SP","R",93,62,66,70,"SI,FC,CH,SL,FF"],["Sean Burke",59,"SP","R",94,56,68,70,"FF,CU,SL,CH"],["Martín Pérez",54,"SP","L",89,70,64,65,"FC,CH,SI,CU"],["Grant Taylor",52,"CL","R",99,54,78,30,"FF,SL,CU"],["Jordan Leasure",74,"RP","R",96,56,70,30,"FF,SL"],["Mike Vasil",34,"RP","R",94,62,70,35,"SI,FF,ST,CH"],["Tyler Gilbert",49,"RP","L",90,68,64,30,"FC,SL,FF"],["Brandon Eisert",51,"RP","L",91,66,66,30,"FF,CH,SL"]]},Ru={hitters:[["Steven Kwan",38,"LF","L","L",80,42,82,64,86,64],["Angel Martínez",1,"CF","S","R",62,50,52,70,72,72,"LF,2B"],["José Ramírez",11,"3B","S","R",80,80,80,74,76,70,"2B"],["Kyle Manzardo",9,"DH","L","R",62,70,66,30,55,50,"1B"],["Chase DeLauter",24,"RF","L","L",66,60,66,50,62,66,"CF"],["C.J. Kayfus",39,"1B","L","L",58,60,60,50,60,56,"LF"],["Bo Naylor",23,"C","L","R",52,62,62,55,72,72],["Brayan Rocchio",4,"SS","S","R",64,42,58,64,80,74,"2B"],["Gabriel Arias",13,"2B","R","R",52,60,40,52,74,82,"SS,3B"],["Daniel Schneemann",10,"2B","L","R",54,54,58,55,66,66,"SS,3B,LF,CF"],["Nolan Jones",22,"LF","L","R",54,62,62,60,60,74,"RF,1B"],["Austin Hedges",27,"C","R","R",40,40,46,25,86,76],["George Valera",58,"RF","L","L",58,60,64,50,62,66,"LF"]],pitchers:[["Tanner Bibee",28,"SP","R",95,68,76,80,"FF,FC,SL,CH,ST,CU"],["Gavin Williams",32,"SP","R",97,54,82,75,"FF,CU,ST,SI,CH"],["Logan Allen",41,"SP","L",92,60,66,70,"FF,ST,CH,CU"],["Slade Cecconi",43,"SP","R",94,62,64,70,"FF,CU,SL,CH"],["Joey Cantillo",54,"SP","L",92,60,76,65,"FF,CH,CU,SL"],["Cade Smith",36,"CL","R",97,72,80,30,"FF,ST,FS"],["Hunter Gaddis",33,"RP","R",95,68,76,30,"SL,FF,CH"],["Tim Herrin",29,"RP","L",95,62,74,30,"SL,KC,FF"],["Erik Sabrowski",55,"RP","L",94,58,78,30,"FF,CU,SL"],["Paul Sewald",37,"RP","R",91,70,66,30,"FF,ST"]]},wu={hitters:[["Gleyber Torres",25,"2B","R","R",70,60,74,45,62,66],["Kerry Carpenter",30,"RF","L","R",68,76,56,45,56,62],["Riley Greene",31,"LF","L","L",70,78,62,58,66,66,"CF"],["Spencer Torkelson",20,"1B","R","R",58,80,60,30,60,60],["Colt Keith",33,"3B","L","R",66,58,62,45,58,64,"2B,1B"],["Dillon Dingler",38,"C","R","R",64,60,52,35,82,78],["Wenceel Pérez",46,"DH","S","R",62,58,56,66,64,64,"RF,CF"],["Javier Báez",28,"SS","R","R",60,56,34,60,80,82,"CF"],["Parker Meadows",22,"CF","L","R",56,56,54,80,86,72],["Zach McKinstry",39,"3B","L","R",66,48,62,66,72,72,"SS,2B,LF,RF"],["Matt Vierling",8,"RF","R","R",64,54,54,60,74,76,"3B,CF"],["Jake Rogers",34,"C","R","R",44,54,50,30,84,80],["Trey Sweeney",27,"SS","L","R",56,48,56,55,74,72,"2B"]],pitchers:[["Tarik Skubal",29,"SP","L",99,84,90,88,"FF,SI,CH,SL,CU"],["Jack Flaherty",45,"SP","R",93,66,78,75,"FF,SL,KC,CH,SI"],["Casey Mize",12,"SP","R",95,70,72,72,"FF,FS,SL,SI,CU"],["Reese Olson",40,"SP","R",95,64,76,70,"SL,CH,SI,FF,CU"],["Troy Melton",64,"SP","R",97,62,72,68,"FF,SL,FS,CU"],["Will Vest",19,"CL","R",97,66,74,30,"FF,SL,CH,SI"],["Kyle Finnegan",67,"RP","R",97,62,72,30,"FF,FS"],["Tommy Kahnle",41,"RP","R",94,62,76,30,"CH,FF"],["Tyler Holton",87,"RP","L",91,74,66,35,"CH,SL,FC,FF,SI"],["Brant Hurter",48,"RP","L",90,66,66,40,"SI,ST,CH,FF"]]},Eu={hitters:[["Jonathan India",6,"LF","R","R",66,56,74,50,60,62,"2B,3B"],["Bobby Witt Jr.",7,"SS","R","R",86,82,66,96,90,84],["Vinnie Pasquantino",9,"1B","L","L",76,72,72,30,64,56],["Salvador Perez",13,"C","R","R",70,76,40,25,72,74,"1B"],["Maikel Garcia",11,"3B","R","R",74,54,66,76,86,80,"2B,SS"],["Mike Yastrzemski",18,"RF","L","L",64,62,72,50,66,66,"LF,CF"],["Carter Jensen",25,"DH","L","R",66,66,70,40,62,70,"C"],["Michael Massey",19,"2B","L","R",60,58,52,40,70,66],["Kyle Isbel",28,"CF","L","R",58,44,50,62,86,72],["Jac Caglianone",14,"RF","L","L",58,76,46,45,56,70,"1B"],["Adam Frazier",26,"2B","L","R",70,40,64,50,66,58,"LF"],["Luke Maile",22,"C","R","R",46,46,52,30,76,68],["Nick Loftin",12,"3B","R","R",62,42,60,60,64,62,"2B,LF,1B"]],pitchers:[["Cole Ragans",55,"SP","L",96,64,84,80,"FF,CH,KC,SL,FC"],["Seth Lugo",67,"SP","R",92,76,80,82,"FF,CU,SI,ST,CH,FC"],["Michael Wacha",52,"SP","R",93,72,72,80,"FF,CH,FC,SI,CU,SL"],["Kris Bubic",50,"SP","L",92,70,76,75,"FF,CH,SL,CU"],["Noah Cameron",61,"SP","L",91,68,72,72,"FF,CH,CU,FC"],["Carlos Estévez",53,"CL","R",97,64,72,30,"FF,SL,CH"],["Lucas Erceg",60,"RP","R",98,60,76,30,"SI,FF,CH,SL"],["John Schreiber",46,"RP","R",92,66,72,30,"SI,ST,CU"],["Angel Zerpa",61,"RP","L",97,62,70,30,"SI,FF,SL,CH"],["Steven Cruz",43,"RP","R",99,52,70,30,"FF,SL"]]},Tu={hitters:[["Luke Keaschall",15,"2B","R","R",70,50,66,70,62,60,"LF,CF"],["Byron Buxton",25,"CF","R","R",66,80,56,84,84,74],["Royce Lewis",23,"3B","R","R",62,72,56,60,66,72,"SS"],["Matt Wallner",38,"RF","L","R",54,84,64,45,58,76],["Trevor Larnach",9,"DH","L","R",64,66,62,40,56,60,"LF"],["Ryan Jeffers",27,"C","R","R",66,64,68,30,70,66,"1B"],["Kody Clemens",2,"1B","L","R",56,62,54,40,60,60,"2B,LF"],["Brooks Lee",72,"SS","S","R",64,50,54,50,74,70,"2B,3B"],["Alan Roden",26,"LF","L","R",62,46,66,55,62,64,"RF"],["Austin Martin",82,"LF","R","R",62,40,66,66,62,58,"CF,2B"],["Edouard Julien",47,"2B","L","R",58,56,72,45,52,56,"1B"],["Christian Vázquez",8,"C","R","R",50,40,48,25,78,72],["Mickey Gasper",77,"1B","S","R",56,48,70,30,56,62,"C"]],pitchers:[["Pablo López",49,"SP","R",95,74,80,82,"FF,CH,ST,CU,SI"],["Joe Ryan",41,"SP","R",94,74,72,78,"FF,ST,FS,SI,CU"],["Bailey Ober",17,"SP","R",91,74,68,76,"FF,CH,SL,CU"],["Simeon Woods Richardson",78,"SP","R",92,62,66,70,"FF,SL,FS,CU"],["Zebby Matthews",52,"SP","R",96,66,70,70,"FF,SL,CU,CH"],["Cole Sands",44,"CL","R",94,64,72,32,"FF,SL,FS,CU"],["Taj Bradley",33,"RP","R",97,60,72,50,"FF,FC,FS,CU"],["Justin Topa",48,"RP","R",95,68,64,30,"SI,SL,CH"],["Kody Funderburk",55,"RP","L",93,60,70,30,"SL,SI,CH"],["Travis Adams",62,"RP","R",94,60,64,40,"FF,SL,CU,CH"]]},Cu={hitters:[["Jeremy Peña",3,"SS","R","R",78,60,58,72,80,78],["Jose Altuve",27,"LF","R","R",78,66,64,58,60,58,"2B"],["Yordan Alvarez",44,"DH","L","R",84,90,86,30,46,56,"LF"],["Carlos Correa",1,"3B","R","R",74,62,76,40,74,78,"SS"],["Christian Walker",8,"1B","R","R",64,74,64,32,80,66],["Yainer Díaz",21,"C","R","R",72,66,46,30,66,76,"1B"],["Isaac Paredes",15,"2B","R","R",66,72,76,30,66,62,"3B,1B"],["Cam Smith",11,"RF","R","R",60,60,60,66,66,82],["Jake Meyers",6,"CF","R","L",64,50,56,70,84,76],["Victor Caratini",17,"C","S","R",66,52,66,25,62,60,"1B"],["Mauricio Dubón",14,"2B","R","R",66,40,54,66,80,70,"SS,3B,LF,CF"],["Jesús Sánchez",12,"RF","L","R",62,66,56,55,62,72,"LF"],["Zach Dezenzo",9,"1B","R","R",58,62,50,45,56,62,"LF"]],pitchers:[["Hunter Brown",58,"SP","R",97,66,82,82,"FF,KC,SI,CH,SL,FC"],["Framber Valdez",59,"SP","L",94,66,82,88,"SI,CU,CH,FC"],["Cristian Javier",53,"SP","R",93,60,74,68,"FF,SL,CU,CH"],["Lance McCullers Jr.",43,"SP","R",94,58,84,60,"ST,KC,SI,CH,FC"],["Spencer Arrighetti",41,"SP","R",94,58,72,70,"FF,CU,FC,ST,CH"],["Josh Hader",71,"CL","L",95,64,84,30,"SI,SL,CH"],["Bryan Abreu",52,"RP","R",97,58,84,30,"SL,FF,CU"],["Bennett Sousa",55,"RP","L",95,62,78,30,"SL,FF"],["Steven Okert",16,"RP","L",92,62,74,30,"SL,FF"],["Bryan King",48,"RP","L",92,66,70,30,"ST,FF,SI,CH"]]},Au={hitters:[["Zach Neto",9,"SS","R","R",66,72,50,74,74,78],["Mike Trout",27,"DH","R","R",64,82,80,50,60,62,"RF,CF"],["Taylor Ward",3,"LF","R","R",60,76,66,45,66,66,"RF"],["Nolan Schanuel",18,"1B","L","L",72,46,80,45,66,52],["Jo Adell",7,"RF","R","R",54,82,46,70,66,76,"CF,LF"],["Logan O'Hoppe",14,"C","R","R",58,70,52,30,70,72],["Yoán Moncada",10,"3B","S","R",60,62,66,40,60,72],["Luis Rengifo",2,"2B","S","R",66,50,56,60,64,64,"3B,SS"],["Bryce Teodosio",19,"CF","R","R",46,40,48,82,84,74],["Jorge Soler",12,"RF","R","R",56,76,64,25,40,56],["Christian Moore",1,"2B","R","R",54,62,52,60,62,66],["Travis d'Arnaud",16,"C","R","R",54,52,56,25,70,62],["Chris Taylor",4,"LF","R","R",52,50,56,60,70,70,"SS,2B,CF"]],pitchers:[["Yusei Kikuchi",16,"SP","L",95,64,78,80,"FF,SL,CU,CH"],["José Soriano",59,"SP","R",98,54,80,75,"SI,KC,FF,FS"],["Tyler Anderson",31,"SP","L",88,70,62,72,"FF,CH,FC,SL"],["Reid Detmers",48,"SP","L",94,58,74,60,"FF,SL,CU,CH"],["Jack Kochanowicz",64,"SP","R",95,58,62,70,"SI,FF,SL,CH"],["Kenley Jansen",74,"CL","R",93,66,76,30,"FC,SI,SL"],["Ben Joyce",44,"RP","R",102,48,70,30,"FF,SL,SI"],["Ryan Zeferjahn",56,"RP","R",97,56,72,30,"FF,FC,ST"],["Brock Burke",46,"RP","L",94,62,70,30,"FF,SL,CH"],["Robert Stephenson",33,"RP","R",96,56,80,30,"FC,SL,FF"]]},Lu={hitters:[["Lawrence Butler",4,"RF","L","R",62,72,60,76,72,72,"CF"],["Jacob Wilson",5,"SS","R","R",86,40,66,50,70,64],["Nick Kurtz",16,"1B","L","L",70,88,74,45,62,60],["Brent Rooker",25,"DH","R","R",64,84,62,35,40,50,"LF"],["Shea Langeliers",23,"C","R","R",60,80,50,30,76,76],["Tyler Soderstrom",21,"LF","L","R",66,74,58,40,62,64,"1B"],["Zack Gelof",20,"2B","R","R",52,66,54,66,66,70],["Max Muncy",2,"3B","R","R",58,56,56,60,68,70,"SS"],["Denzel Clarke",15,"CF","R","R",50,58,52,82,94,78],["JJ Bleday",33,"CF","L","L",56,66,68,55,66,62,"LF,RF"],["Willie MacIver",26,"C","R","R",50,48,52,30,68,66],["Darell Hernaiz",48,"SS","R","R",60,42,52,55,64,66,"2B,3B"],["Colby Thomas",34,"RF","R","R",52,66,46,55,62,70,"LF"]],pitchers:[["Luis Severino",40,"SP","R",95,66,70,78,"FF,SI,ST,CH,FC"],["Jeffrey Springs",59,"SP","L",90,68,76,74,"FF,CH,SL,SI"],["Jacob Lopez",41,"SP","L",91,64,76,70,"FF,SL,FC,CU"],["J.T. Ginn",64,"SP","R",95,64,70,66,"SI,SL,CH,FF"],["Luis Morales",63,"SP","R",98,56,74,65,"FF,SL,CU,CH"],["Tyler Ferguson",66,"CL","R",96,58,74,30,"FF,SL"],["Jack Perkins",61,"RP","R",97,60,72,35,"FF,SL,CU,CH"],["Hogan Harris",58,"RP","L",93,60,72,40,"FF,CU,CH,SL"],["Elvis Alvarado",62,"RP","R",98,54,70,30,"FF,SL"],["Justin Sterner",52,"RP","R",93,64,72,30,"FF,SL,CU"]]},Pu={hitters:[["Randy Arozarena",56,"LF","R","R",66,72,68,70,70,70,"RF"],["Julio Rodríguez",44,"CF","R","R",74,78,54,84,84,80],["Cal Raleigh",29,"C","S","R",62,98,70,30,80,76,"1B"],["Josh Naylor",12,"1B","L","L",76,70,70,50,62,56],["Eugenio Suárez",28,"3B","R","R",58,88,62,30,66,74],["Jorge Polanco",7,"DH","S","R",70,70,66,40,62,66,"2B"],["Dominic Canzone",8,"RF","L","R",64,68,56,45,58,62,"LF"],["J.P. Crawford",3,"SS","L","R",66,48,78,50,74,70],["Cole Young",2,"2B","L","R",62,46,66,60,70,66,"SS"],["Mitch Garver",18,"C","R","R",52,64,64,25,56,60,"1B"],["Victor Robles",10,"RF","R","R",58,40,50,80,78,84,"CF"],["Leo Rivas",76,"2B","S","R",56,32,74,66,66,64,"SS,LF"],["Luke Raley",20,"1B","L","L",58,68,60,60,64,66,"RF,LF"]],pitchers:[["Logan Gilbert",36,"SP","R",96,82,82,82,"FF,SL,FS,CU,ST"],["George Kirby",68,"SP","R",97,88,74,82,"FF,SI,SL,KC,CH,FS"],["Bryan Woo",22,"SP","R",96,78,76,80,"FF,SI,ST,CH"],["Luis Castillo",58,"SP","R",95,70,74,82,"FF,SI,CH,SL"],["Bryce Miller",50,"SP","R",96,70,74,76,"FF,FS,ST,SI,KC"],["Andrés Muñoz",75,"CL","R",100,62,86,30,"SL,FF,SI"],["Matt Brash",47,"RP","R",98,54,86,30,"SL,SI,KC"],["Gabe Speier",55,"RP","L",94,74,74,30,"FF,SL,CH"],["Eduard Bazardo",83,"RP","R",95,70,72,30,"FF,ST,SI"],["Carlos Vargas",38,"RP","R",99,54,70,30,"SI,FC,SL"]]},Fu={hitters:[["Evan Carter",32,"CF","L","L",66,60,80,76,76,66,"LF"],["Corey Seager",5,"SS","L","R",80,82,78,35,70,74],["Wyatt Langford",36,"LF","R","R",66,74,70,74,74,70,"CF,RF"],["Adolis García",53,"RF","R","R",56,72,46,60,72,88],["Josh Jung",6,"3B","R","R",66,64,50,45,70,72],["Jake Burger",30,"1B","R","R",60,76,44,30,56,64,"3B"],["Marcus Semien",2,"2B","R","R",66,64,66,58,78,70],["Joc Pederson",3,"DH","L","R",58,70,72,25,40,50],["Jonah Heim",28,"C","S","R",56,54,56,25,78,70],["Josh Smith",8,"3B","L","R",66,50,70,60,70,70,"SS,2B,LF,RF"],["Kyle Higashioka",11,"C","R","R",46,62,44,20,76,70],["Ezequiel Duran",20,"2B","R","R",62,54,46,66,64,70,"3B,SS,LF"],["Sam Haggerty",0,"LF","S","R",58,36,60,78,70,64,"CF,RF"]],pitchers:[["Jacob deGrom",48,"SP","R",99,82,88,70,"FF,SL,CH,CU"],["Nathan Eovaldi",17,"SP","R",95,76,80,76,"FF,FS,CU,SL,FC"],["Merrill Kelly",29,"SP","R",92,74,72,80,"FF,CH,FC,CU,SI,SL"],["Jack Leiter",35,"SP","R",97,56,76,72,"FF,SL,CU,CH,SI"],["Patrick Corbin",46,"SP","L",91,62,64,76,"SI,SL,FF,CH"],["Shawn Armstrong",45,"CL","R",95,70,74,32,"FC,FF,SI,CU,ST"],["Chris Martin",31,"RP","R",94,86,66,30,"FF,FC,FS,SL"],["Robert Garcia",61,"RP","L",94,64,76,30,"FF,CH,SL"],["Phil Maton",88,"RP","R",90,64,76,30,"CU,FC,FF"],["Hoby Milner",51,"RP","L",87,74,64,30,"SI,SL,CH"]]},Iu={hitters:[["Ronald Acuña Jr.",13,"RF","R","R",78,82,80,88,70,82],["Ozzie Albies",1,"2B","S","R",70,66,56,66,74,66],["Matt Olson",28,"1B","L","R",70,82,76,30,80,66],["Austin Riley",27,"3B","R","R",70,80,52,40,68,76],["Marcell Ozuna",20,"DH","R","R",68,76,70,25,40,50],["Drake Baldwin",30,"C","L","R",70,64,62,30,66,70],["Michael Harris II",23,"CF","L","L",70,64,46,78,88,78],["Jurickson Profar",7,"LF","S","R",70,60,80,45,60,56],["Ha-Seong Kim",9,"SS","R","R",64,46,66,66,82,76,"2B,3B"],["Sean Murphy",12,"C","R","R",54,66,62,25,82,74],["Nick Allen",2,"SS","R","R",54,26,50,60,90,80,"2B,3B"],["Eli White",36,"CF","R","R",52,46,50,74,76,74,"LF,RF"],["Jarred Kelenic",24,"LF","L","L",56,64,56,60,66,66,"RF"]],pitchers:[["Chris Sale",51,"SP","L",96,78,86,74,"SL,FF,CH,SI"],["Spencer Schwellenbach",56,"SP","R",97,80,78,78,"FF,SL,FS,CU,SI,FC"],["Spencer Strider",99,"SP","R",97,62,86,74,"FF,SL,CU,CH"],["Reynaldo López",40,"SP","R",96,64,74,70,"FF,SL,CU,CH"],["Bryce Elder",55,"SP","R",91,62,68,74,"SI,SL,CH,FF"],["Raisel Iglesias",26,"CL","R",96,74,80,30,"SI,CH,SL,FF"],["Pierce Johnson",38,"RP","R",96,62,80,30,"CU,FC,FF"],["Dylan Lee",52,"RP","L",92,74,74,30,"SL,FF,CH"],["Aaron Bummer",49,"RP","L",93,64,74,30,"SI,ST,FC,CU"],["Joe Jiménez",77,"RP","R",95,60,72,30,"FF,SL"]]},Du={hitters:[["Xavier Edwards",63,"SS","S","R",76,30,68,82,72,68,"2B"],["Jakob Marsee",87,"CF","L","L",66,58,74,76,74,64,"LF"],["Kyle Stowers",28,"LF","L","L",62,76,58,55,66,70,"RF"],["Agustín Ramírez",4,"DH","R","R",62,72,54,50,52,66,"C"],["Otto Lopez",61,"2B","R","R",70,52,60,66,76,76,"SS"],["Connor Norby",24,"3B","R","R",64,60,52,50,56,64,"2B,LF"],["Eric Wagaman",23,"1B","R","R",66,56,52,40,60,58],["Heriberto Hernández",27,"RF","R","R",58,66,56,50,58,66,"LF"],["Liam Hicks",18,"C","L","R",70,42,74,25,62,60,"1B"],["Dane Myers",54,"CF","R","R",60,50,50,72,74,72,"LF,RF"],["Javier Sanoja",86,"2B","R","R",66,30,64,66,72,66,"SS,LF,CF"],["Griffin Conine",56,"RF","L","R",54,62,54,50,60,66],["Graham Pauley",15,"3B","L","R",56,54,56,50,62,66,"2B,LF"]],pitchers:[["Sandy Alcantara",22,"SP","R",98,70,80,85,"SI,CH,FF,SL,CU"],["Eury Pérez",39,"SP","R",98,64,82,72,"FF,ST,CU,CH,SL"],["Edward Cabrera",27,"SP","R",97,56,82,72,"CU,CH,SI,FF,SL"],["Max Meyer",23,"SP","R",95,62,80,68,"SL,FF,CH,SI"],["Janson Junk",41,"SP","R",92,72,64,70,"FF,SL,CU,CH"],["Ronny Henriquez",31,"CL","R",97,60,76,30,"CH,SL,FF,SI"],["Calvin Faucher",53,"RP","R",96,60,72,30,"SI,FC,CU,ST"],["Tyler Phillips",59,"RP","R",93,76,66,40,"FF,CH,SL,CU"],["Lake Bachar",58,"RP","R",95,56,72,30,"FF,SL,CH"],["Andrew Nardi",43,"RP","L",94,56,74,30,"FF,SL,CH"]]},Bu={hitters:[["Francisco Lindor",12,"SS","S","R",76,78,68,70,84,80],["Juan Soto",22,"RF","L","L",82,86,99,50,56,62,"LF"],["Pete Alonso",20,"1B","R","R",66,88,62,25,58,60],["Brandon Nimmo",9,"LF","L","R",68,68,74,50,64,60,"CF"],["Mark Vientos",27,"DH","R","R",62,74,50,30,54,70,"3B,1B"],["Brett Baty",22,"3B","L","R",62,64,58,45,66,72,"2B"],["Jeff McNeil",1,"2B","L","R",74,46,64,45,70,64,"LF,RF,CF"],["Francisco Alvarez",4,"C","R","R",60,74,56,30,66,74],["Cedric Mullins",31,"CF","L","L",64,60,62,74,74,60],["Starling Marte",6,"RF","R","R",66,54,52,55,56,66],["Luis Torrens",13,"C","R","R",48,50,46,25,76,78],["Tyrone Taylor",15,"CF","R","R",56,50,46,64,82,74,"LF,RF"],["Ronny Mauricio",10,"2B","S","R",56,62,40,66,60,74,"3B,SS"]],pitchers:[["Kodai Senga",34,"SP","R",95,62,86,70,"FF,FS,FC,SL,CU"],["David Peterson",23,"SP","L",93,64,72,78,"SI,FF,SL,CH,CU"],["Nolan McLean",26,"SP","R",95,64,80,70,"SI,ST,CU,FF,CH"],["Clay Holmes",35,"SP","R",95,62,76,72,"SI,ST,FF,CH,SL"],["Sean Manaea",59,"SP","L",92,66,72,70,"SI,ST,FF,CH"],["Edwin Díaz",39,"CL","R",98,64,90,30,"FF,SL"],["Ryan Helsley",56,"RP","R",100,56,80,30,"FF,SL,CU"],["Gregory Soto",65,"RP","L",97,54,74,30,"SI,SL,FF"],["Tyler Rogers",71,"RP","R",83,80,72,30,"SI,SL"],["Reed Garrett",75,"RP","R",96,60,76,30,"SI,FS,SL,CU"]]},Uu={hitters:[["Trea Turner",7,"SS","R","R",80,64,56,86,76,74],["Kyle Schwarber",12,"DH","L","R",62,94,78,30,40,50,"LF"],["Bryce Harper",3,"1B","L","R",76,80,82,50,66,62],["Alec Bohm",28,"3B","R","R",76,58,60,40,62,70,"1B"],["J.T. Realmuto",10,"C","R","R",66,58,56,50,80,84],["Nick Castellanos",8,"RF","R","R",64,66,46,35,52,64],["Brandon Marsh",16,"LF","L","L",66,56,60,60,72,66,"CF"],["Harrison Bader",2,"CF","R","R",64,52,52,72,88,76],["Bryson Stott",5,"2B","L","R",66,50,66,66,76,70,"SS"],["Max Kepler",17,"RF","L","L",58,62,64,45,66,66,"1B,LF"],["Edmundo Sosa",33,"3B","R","R",62,54,42,60,74,74,"SS,2B"],["Rafael Marchán",13,"C","S","R",54,36,60,25,70,70],["Otto Kemp",46,"3B","R","R",56,58,62,50,60,66,"1B,LF"]],pitchers:[["Zack Wheeler",45,"SP","R",97,80,86,86,"FF,SI,ST,FS,CU,FC"],["Cristopher Sánchez",61,"SP","L",95,76,82,84,"SI,CH,SL"],["Jesús Luzardo",44,"SP","L",97,62,80,76,"FF,ST,CH,SI"],["Ranger Suárez",55,"SP","L",91,74,76,78,"SI,CH,FC,CU,FF"],["Aaron Nola",27,"SP","R",92,76,78,82,"KC,FF,SI,CH,FC"],["Jhoan Duran",59,"CL","R",101,64,86,30,"FS,FF,KC"],["Matt Strahm",25,"RP","L",93,70,76,30,"FF,SL,CU,CH"],["Orion Kerkering",50,"RP","R",97,62,80,30,"ST,SI,FF"],["José Alvarado",46,"RP","L",99,54,80,30,"SI,FC,CU"],["David Robertson",30,"RP","R",92,66,76,30,"FC,KC,ST,FF"]]},Nu={hitters:[["CJ Abrams",5,"SS","L","R",70,64,52,86,66,74],["James Wood",29,"LF","L","R",66,84,74,70,64,72,"RF"],["Luis García Jr.",2,"2B","L","R",70,58,48,55,60,62],["Josh Bell",19,"1B","S","R",62,64,64,25,52,56],["Dylan Crews",3,"RF","R","R",58,62,62,76,72,74,"CF"],["Daylen Lile",1,"DH","L","R",72,50,62,70,64,62,"LF,RF"],["Keibert Ruiz",20,"C","S","R",66,50,54,25,58,62],["Brady House",15,"3B","R","R",58,62,44,45,70,80],["Jacob Young",30,"CF","R","R",62,30,54,82,92,74],["Riley Adams",15,"C","R","R",50,60,52,30,64,70,"1B"],["Jose Tena",8,"3B","L","R",60,52,48,55,66,70,"2B,SS"],["Amed Rosario",14,"2B","R","R",68,46,40,60,60,66,"SS,3B,LF"],["Robert Hassell III",11,"RF","L","L",58,46,56,62,70,64,"CF,LF"]],pitchers:[["MacKenzie Gore",1,"SP","L",96,60,82,74,"FF,CU,SL,CH,FC"],["Jake Irvin",27,"SP","R",93,64,70,76,"FF,CU,SI,CH,SL"],["Cade Cavalli",24,"SP","R",97,58,78,66,"SI,KC,FF,CH,SL"],["Mitchell Parker",70,"SP","L",91,60,66,74,"FF,FS,CU,SL"],["Brad Lord",40,"SP","R",94,62,66,70,"FF,SI,ST,CH"],["Jose A. Ferrer",47,"CL","L",98,64,72,30,"SI,CH,SL"],["Clayton Beeter",67,"RP","R",96,56,78,30,"FF,SL,CU"],["Cole Henry",56,"RP","R",95,60,74,32,"FF,SL,CU"],["Jackson Rutledge",79,"RP","R",97,56,70,35,"FF,SL,CU,SI"],["PJ Poulin",63,"RP","L",92,62,70,30,"FF,SL"]]},Ou={hitters:[["Michael Busch",29,"1B","L","R",68,72,70,40,68,60],["Kyle Tucker",30,"RF","L","R",80,80,86,62,74,72],["Seiya Suzuki",27,"DH","R","R",70,76,72,50,60,66,"RF"],["Pete Crow-Armstrong",4,"CF","L","L",66,74,40,88,99,84],["Ian Happ",8,"LF","S","R",64,68,76,50,70,66],["Dansby Swanson",7,"SS","R","R",62,64,54,60,86,78],["Nico Hoerner",2,"2B","R","R",78,40,64,72,90,72,"SS"],["Carson Kelly",15,"C","R","R",62,60,64,25,74,66],["Matt Shaw",6,"3B","R","R",62,58,58,72,74,72,"2B"],["Miguel Amaya",9,"C","R","R",56,58,54,25,70,74],["Justin Turner",11,"1B","R","R",62,50,64,25,56,50,"3B"],["Moisés Ballesteros",25,"C","L","R",70,58,62,25,46,56,"1B"],["Kevin Alcántara",23,"CF","R","R",54,64,46,70,76,74,"LF,RF"]],pitchers:[["Shota Imanaga",18,"SP","L",92,82,80,76,"FF,FS,ST,SI,CU"],["Matthew Boyd",16,"SP","L",91,74,74,74,"FF,CH,SL,CU,SI"],["Cade Horton",22,"SP","R",96,64,80,72,"FF,ST,CU,CH,SI"],["Jameson Taillon",50,"SP","R",93,78,70,78,"FF,CU,FC,SI,CH,ST"],["Justin Steele",35,"SP","L",92,72,74,78,"FF,SL,CU,CH,SI"],["Daniel Palencia",48,"CL","R",99,56,76,30,"FF,SL"],["Brad Keller",40,"RP","R",96,62,74,30,"SI,SL,FF,CH"],["Andrew Kittredge",46,"RP","R",95,72,72,30,"SI,SL,FF"],["Drew Pomeranz",61,"RP","L",92,62,74,30,"FF,CU,FC"],["Caleb Thielbar",56,"RP","L",90,70,70,30,"FF,SL,CU"]]},zu={hitters:[["TJ Friedl",29,"CF","L","L",66,52,66,74,78,64],["Matt McLain",9,"2B","R","R",58,60,64,74,74,70,"SS"],["Elly De La Cruz",44,"SS","S","R",64,80,52,99,70,99],["Austin Hays",24,"LF","R","R",66,64,52,50,62,66],["Sal Stewart",27,"DH","R","R",66,66,66,40,58,62,"1B,3B"],["Spencer Steer",7,"1B","R","R",62,64,66,45,62,62,"LF,3B"],["Tyler Stephenson",37,"C","R","R",66,60,58,25,66,70],["Noelvi Marte",16,"RF","R","R",62,66,44,66,62,76,"3B"],["Ke'Bryan Hayes",13,"3B","R","R",62,40,54,60,94,80],["Gavin Lux",2,"2B","L","R",66,50,64,50,56,60,"LF"],["Jose Trevino",4,"C","R","R",52,40,48,20,82,70],["Will Benson",30,"RF","L","L",50,70,62,66,66,70,"LF,CF"],["Miguel Andujar",22,"LF","R","R",72,54,46,35,52,62,"1B,3B"]],pitchers:[["Hunter Greene",21,"SP","R",101,64,82,75,"FF,SL,FS"],["Andrew Abbott",41,"SP","L",93,70,72,76,"FF,CH,ST,CU"],["Nick Lodolo",40,"SP","L",93,70,80,72,"SI,CU,CH,FF"],["Chase Burns",26,"SP","R",99,58,84,66,"FF,SL,CU,CH"],["Brady Singer",51,"SP","R",93,66,72,78,"SI,SL,FF,CH"],["Emilio Pagán",15,"CL","R",96,66,74,30,"FF,FC,FS"],["Tony Santillan",64,"RP","R",96,58,74,30,"FF,SL,FS"],["Graham Ashcraft",51,"RP","R",98,60,76,35,"FC,SL,SI"],["Scott Barlow",58,"RP","R",92,60,74,30,"SL,CU,FF,SI"],["Sam Moll",61,"RP","L",92,60,70,30,"SI,SL,CH"]]},ku={hitters:[["Sal Frelick",10,"RF","L","R",76,36,72,72,88,70,"CF,LF"],["Brice Turang",2,"2B","L","R",70,54,66,84,92,72,"SS"],["William Contreras",24,"C","R","R",74,64,74,35,74,80,"1B"],["Christian Yelich",22,"DH","L","R",70,70,76,55,50,50,"LF"],["Jackson Chourio",11,"CF","R","R",70,72,52,82,74,74,"LF"],["Andrew Vaughn",28,"1B","R","R",70,62,56,30,62,58],["Isaac Collins",8,"LF","S","R",68,50,80,70,70,66,"RF"],["Caleb Durbin",21,"3B","R","R",72,44,70,72,76,70,"2B"],["Joey Ortiz",3,"SS","R","R",62,44,54,60,88,80,"3B,2B"],["Rhys Hoskins",12,"1B","R","R",58,72,70,30,56,56],["Danny Jansen",9,"C","R","R",54,60,66,25,70,66],["Blake Perkins",16,"CF","S","R",56,40,62,70,90,82,"LF,RF"],["Andruw Monasterio",14,"3B","R","R",62,40,56,55,66,66,"2B,SS"]],pitchers:[["Freddy Peralta",51,"SP","R",94,66,82,80,"FF,CH,CU,SL"],["Jacob Misiorowski",32,"SP","R",100,54,86,66,"FF,FC,CU,SL"],["Brandon Woodruff",53,"SP","R",94,74,80,70,"FF,SI,CH,FC,SL,CU"],["Quinn Priester",46,"SP","R",94,66,72,74,"SI,FF,SL,CU,CH"],["Jose Quintana",62,"SP","L",90,72,66,72,"SI,FF,CH,CU"],["Trevor Megill",29,"CL","R",99,64,80,30,"FF,KC"],["Abner Uribe",45,"RP","R",100,52,84,30,"SI,SL,FF"],["Jared Koenig",47,"RP","L",94,66,72,30,"SI,FC,CU,CH"],["Nick Mears",52,"RP","R",96,62,76,30,"FF,SL,CU"],["Grant Anderson",37,"RP","R",94,62,72,30,"SI,ST,FF"]]},Hu={hitters:[["Oneil Cruz",15,"CF","L","R",54,90,58,90,66,99,"SS"],["Bryan Reynolds",10,"RF","S","R",70,68,66,45,56,62,"LF"],["Spencer Horwitz",48,"1B","L","R",72,54,76,30,58,52],["Andrew McCutchen",22,"DH","R","R",64,60,76,35,40,50],["Nick Gonzales",39,"2B","R","R",70,46,54,55,70,66],["Tommy Pham",28,"LF","R","R",62,56,66,50,56,60],["Konnor Griffin",6,"SS","R","R",64,70,56,80,76,76,"CF"],["Jared Triolo",19,"3B","R","R",60,40,62,60,88,78,"2B,SS,1B"],["Joey Bart",14,"C","R","R",58,54,60,25,66,74],["Henry Davis",32,"C","R","R",50,56,54,40,66,78,"RF"],["Jack Suwinski",65,"LF","L","R",46,70,58,60,68,70,"CF,RF"],["Alexander Canario",29,"RF","R","R",52,70,46,60,62,72,"LF"],["Liover Peguero",13,"2B","R","R",60,46,42,66,68,72,"SS"]],pitchers:[["Paul Skenes",30,"SP","R",99,82,88,86,"FF,SI,ST,CH,CU,SL"],["Mitch Keller",23,"SP","R",95,70,74,82,"FF,SI,ST,CU,CH,FC"],["Bubba Chandler",34,"SP","R",99,58,78,70,"FF,SL,CH,CU"],["Mike Burrows",52,"SP","R",96,62,76,70,"FF,CU,CH,SL"],["Braxton Ashcraft",61,"SP","R",96,62,76,66,"FF,SI,SL,CU"],["Dennis Santana",60,"CL","R",95,66,74,30,"SL,SI,FF"],["Colin Holderman",35,"RP","R",97,58,74,30,"SI,ST,FF,FC"],["Isaac Mattson",64,"RP","R",94,62,70,30,"FF,SL,CH"],["Carmen Mlodzinski",50,"RP","R",96,62,70,40,"FF,SI,ST,FS,CU"],["Evan Sisk",58,"RP","L",91,60,68,30,"SL,SI"]]},Gu={hitters:[["Brendan Donovan",33,"2B","L","R",76,52,72,50,70,62,"LF,3B,1B"],["Lars Nootbaar",21,"LF","L","R",62,62,78,55,66,70,"RF,CF"],["Willson Contreras",40,"1B","R","R",66,72,64,30,62,74,"C"],["Iván Herrera",48,"DH","R","R",72,62,66,30,56,66,"C"],["Alec Burleson",41,"RF","L","L",74,60,58,35,56,56,"1B,LF"],["Nolan Arenado",28,"3B","R","R",64,60,60,30,88,84],["Masyn Winn",0,"SS","R","R",72,54,52,74,90,94],["Pedro Pagés",43,"C","R","R",46,50,46,25,82,76],["Victor Scott II",11,"CF","L","L",56,30,54,96,92,76],["Jordan Walker",18,"RF","R","R",54,70,44,60,62,80],["Nolan Gorman",16,"3B","L","R",50,76,56,45,62,66,"2B"],["Thomas Saggese",25,"2B","R","R",58,50,52,50,68,66,"SS,3B"],["Yohel Pozo",74,"C","R","R",66,50,46,20,56,60,"1B"]],pitchers:[["Sonny Gray",54,"SP","R",93,74,82,82,"FF,SI,ST,CU,CH,FC"],["Miles Mikolas",39,"SP","R",92,82,62,82,"SI,FF,SL,CU,CH"],["Matthew Liberatore",52,"SP","L",93,70,72,74,"FF,SL,CU,CH,SI"],["Michael McGreevy",36,"SP","R",92,74,66,74,"SI,FF,SL,CU,CH"],["Andre Pallante",53,"SP","R",95,62,68,76,"FF,SI,CU,SL"],["Riley O'Brien",55,"CL","R",97,58,76,30,"SI,FF,SL"],["JoJo Romero",59,"RP","L",94,62,76,30,"SI,SL,CH"],["Kyle Leahy",61,"RP","R",94,62,70,35,"SI,FF,ST,CU,CH"],["Gordon Graceffo",67,"RP","R",95,62,70,35,"FF,SL,CU,CH"],["Matt Svanson",72,"RP","R",96,56,72,30,"SI,SL,FF"]]},Vu={hitters:[["Corbin Carroll",7,"RF","L","L",70,78,78,90,76,66,"CF"],["Ketel Marte",4,"2B","S","R",80,80,74,50,70,70],["Geraldo Perdomo",2,"SS","S","R",76,56,84,64,84,80],["Lourdes Gurriel Jr.",12,"LF","R","R",70,66,54,45,64,72],["Gabriel Moreno",14,"C","R","R",72,50,66,30,82,80],["Pavin Smith",26,"1B","L","L",66,58,74,30,62,56],["Adrian Del Castillo",46,"DH","L","R",60,60,56,25,48,60,"C"],["Blaze Alexander",9,"3B","R","R",56,52,50,60,66,84,"SS,LF"],["Alek Thomas",5,"CF","L","L",62,50,52,72,84,70],["Jose Herrera",11,"C","S","R",46,30,56,20,76,70],["Jake McCarthy",31,"CF","L","L",66,40,54,82,76,66,"RF,LF"],["Tim Tawa",23,"2B","R","R",58,58,52,55,62,66,"3B,LF,CF"],["Jordan Lawlar",10,"3B","R","R",58,56,56,70,66,72,"SS"]],pitchers:[["Zac Gallen",23,"SP","R",94,70,80,82,"FF,KC,CH,FC,SL"],["Corbin Burnes",39,"SP","R",95,76,86,82,"FC,SI,CU,CH,SL"],["Eduardo Rodriguez",57,"SP","L",92,70,70,74,"FF,CH,FC,SL,SI,CU"],["Brandon Pfaadt",32,"SP","R",94,70,72,78,"FF,ST,SI,CH,CU"],["Ryne Nelson",19,"SP","R",96,64,68,72,"FF,SL,FC,CU,CH"],["Justin Martinez",63,"CL","R",102,50,80,30,"FS,SI,SL,FF"],["Kevin Ginkel",37,"RP","R",96,62,76,30,"FF,SL"],["Andrew Saalfrank",61,"RP","L",92,60,70,30,"SI,CU"],["Jalen Beeks",68,"RP","L",92,62,70,30,"CH,FF,FC"],["Ryan Thompson",81,"RP","R",90,66,70,30,"SI,ST"]]},Wu={hitters:[["Tyler Freeman",1,"2B","R","R",66,34,66,60,66,64,"SS,LF,RF"],["Ezequiel Tovar",14,"SS","R","R",66,60,42,66,84,82],["Hunter Goodman",15,"C","R","R",62,80,46,35,58,74,"RF,1B"],["Jordan Beck",27,"LF","R","R",58,66,56,66,70,74,"RF"],["Mickey Moniak",22,"RF","L","L",60,64,46,60,68,70,"CF,LF"],["Brenton Doyle",9,"CF","R","R",58,60,44,84,94,92],["Michael Toglia",4,"1B","S","L",48,72,58,50,70,66],["Kyle Karros",30,"3B","R","R",58,46,58,45,70,72],["Warming Bernabel",2,"DH","R","R",60,52,40,40,56,60,"3B,1B"],["Drew Romo",7,"C","S","R",54,40,50,30,74,76],["Thairo Estrada",39,"2B","R","R",62,46,44,60,70,66,"SS,3B"],["Kris Bryant",23,"DH","R","R",62,60,64,35,50,60,"1B,LF,3B"],["Yanquiel Fernández",6,"RF","L","L",52,66,40,40,52,68,"LF"]],pitchers:[["Kyle Freeland",21,"SP","L",91,64,64,76,"FF,KC,SL,CH,SI"],["Germán Márquez",48,"SP","R",95,62,72,72,"FF,KC,SI,SL,CH"],["Chase Dollander",32,"SP","R",98,52,72,68,"FF,CU,SI,SL,CH"],["Tanner Gordon",61,"SP","R",93,66,62,68,"FF,SL,FS,CU"],["Antonio Senzatela",49,"SP","R",93,62,54,68,"FF,SL,CU,CH"],["Victor Vodnik",38,"CL","R",99,54,74,30,"SI,FF,CH,SL"],["Seth Halvorsen",44,"RP","R",101,54,72,30,"FF,FS,SL"],["Juan Mejia",47,"RP","R",97,50,70,30,"FF,SL"],["Jimmy Herget",54,"RP","R",91,66,70,30,"SI,ST,CH"],["Lucas Gilbreath",58,"RP","L",93,56,72,30,"FF,SL"]]},$u={hitters:[["Shohei Ohtani",17,"DH","L","R",86,96,82,82,50,80],["Mookie Betts",50,"SS","R","R",72,66,82,60,80,76,"2B,RF"],["Freddie Freeman",5,"1B","L","R",80,70,80,40,72,60],["Will Smith",16,"C","R","R",70,66,76,30,72,70],["Teoscar Hernández",37,"RF","R","R",64,76,50,45,54,70,"LF"],["Max Muncy",13,"3B","L","R",58,74,84,30,58,66,"2B,1B"],["Tommy Edman",25,"2B","S","R",66,54,56,74,86,76,"CF,SS,3B"],["Andy Pages",44,"CF","R","R",66,66,54,60,82,80,"RF"],["Kiké Hernández",8,"LF","R","R",56,54,56,45,76,72,"2B,3B,CF"],["Michael Conforto",23,"LF","L","R",54,60,66,30,54,60,"RF"],["Dalton Rushing",68,"C","L","R",54,62,60,30,62,70],["Miguel Rojas",11,"SS","R","R",64,36,60,45,82,74,"2B,3B"],["Hyeseong Kim",6,"2B","L","R",64,30,50,82,76,72,"SS,CF"]],pitchers:[["Yoshinobu Yamamoto",18,"SP","R",96,80,88,82,"FF,FS,CU,SI,FC,SL"],["Shohei Ohtani",17,"SP","R",100,66,88,70,"FF,ST,SI,CU,FS,SL"],["Blake Snell",7,"SP","L",96,58,88,74,"FF,CH,CU,SL"],["Tyler Glasnow",31,"SP","R",97,60,86,66,"FF,SL,CU,SI"],["Roki Sasaki",11,"SP","R",99,54,84,64,"FF,FS,SL"],["Tanner Scott",66,"CL","L",97,58,80,30,"SL,FF"],["Blake Treinen",49,"RP","R",96,62,76,30,"ST,SI,FC"],["Alex Vesia",51,"RP","L",94,64,80,30,"FF,SL,CH"],["Anthony Banda",43,"RP","L",95,62,70,30,"SI,SL,FF"],["Jack Dreyer",61,"RP","L",93,66,70,30,"FF,ST,CU"]]},Xu={hitters:[["Fernando Tatis Jr.",23,"RF","R","R",72,78,66,74,84,88],["Luis Arraez",4,"1B","L","R",90,30,70,40,52,50,"2B"],["Manny Machado",13,"3B","R","R",74,76,66,40,76,82],["Jackson Merrill",3,"CF","L","R",72,70,54,64,78,70],["Ryan O'Hearn",19,"DH","L","L",70,62,68,30,62,56,"1B,RF"],["Xander Bogaerts",2,"SS","R","R",70,52,64,50,72,70,"2B"],["Ramón Laureano",22,"LF","R","R",64,68,60,55,70,80,"RF"],["Jake Cronenworth",9,"2B","L","R",64,56,70,40,74,70,"1B,SS"],["Freddy Fermin",34,"C","R","R",64,40,56,30,76,72],["Gavin Sheets",30,"LF","L","R",60,68,56,30,50,56,"1B,RF"],["Elías Díaz",12,"C","R","R",56,50,50,20,66,66],["Jose Iglesias",11,"SS","R","R",66,40,44,40,72,66,"2B,3B"],["Bryce Johnson",25,"CF","S","R",52,30,52,80,80,70,"LF,RF"]],pitchers:[["Dylan Cease",84,"SP","R",97,56,86,82,"SL,FF,KC,CH,ST"],["Nick Pivetta",27,"SP","R",95,66,78,80,"FF,CU,ST,SL"],["Michael King",34,"SP","R",94,70,80,76,"SI,CH,ST,FF,SL"],["Yu Darvish",11,"SP","R",93,70,78,66,"FC,ST,SI,FF,FS,CU"],["Randy Vásquez",98,"SP","R",94,58,72,68,"FF,CU,FC,ST,SI"],["Mason Miller",22,"CL","R",103,60,90,30,"FF,SL,CH"],["Robert Suarez",75,"RP","R",99,66,76,30,"FF,SI,CH"],["Adrián Morejón",50,"RP","L",98,66,76,30,"SI,SL,FS"],["Jason Adam",47,"RP","R",94,64,80,30,"CH,ST,FF"],["Jeremiah Estrada",56,"RP","R",98,56,80,30,"FF,FS,SL"]]},qu={hitters:[["Jung Hoo Lee",51,"CF","L","R",76,46,72,64,74,66],["Heliot Ramos",17,"LF","R","R",66,66,54,55,60,74,"RF"],["Rafael Devers",16,"1B","L","R",76,84,72,30,56,66,"3B"],["Willy Adames",2,"SS","R","R",62,74,64,60,76,80],["Matt Chapman",26,"3B","R","R",64,66,66,50,92,86],["Wilmer Flores",41,"DH","R","R",64,60,60,25,56,56,"1B"],["Casey Schmitt",10,"2B","R","R",62,56,44,50,72,74,"3B,1B,SS"],["Drew Gilbert",3,"RF","L","L",58,54,60,60,70,70,"CF,LF"],["Patrick Bailey",14,"C","S","R",52,44,54,30,96,84],["Andrew Knizner",40,"C","R","R",46,40,50,20,66,64],["Christian Koss",50,"SS","R","R",60,42,46,55,68,70,"2B,3B"],["Dominic Smith",22,"1B","L","L",64,52,60,30,66,56,"LF"],["Bryce Eldridge",18,"1B","L","R",54,74,54,30,50,56]],pitchers:[["Logan Webb",62,"SP","R",93,82,78,90,"SI,CH,ST,FF,FC,CU"],["Robbie Ray",38,"SP","L",93,60,82,78,"FF,SL,KC,CH,SI"],["Justin Verlander",35,"SP","R",94,70,76,72,"FF,SL,CU,CH"],["Landen Roupp",65,"SP","R",93,62,74,66,"SI,CU,CH,FF,SL"],["Hayden Birdsong",60,"SP","R",96,54,72,66,"FF,SL,CU,CH"],["Ryan Walker",74,"CL","R",95,64,76,30,"SI,SL,FF"],["Erik Miller",68,"RP","L",95,56,80,30,"SI,SL,CH"],["Tristan Beck",43,"RP","R",94,62,72,35,"SI,FF,CU,SL,CH"],["Spencer Bivens",71,"RP","R",94,68,72,35,"SI,ST,CH"],["Joey Lucchesi",37,"RP","L",90,62,68,30,"SI,CH,CU"]]},te=(i,t,e="#ffffff",n="#ffffff")=>({primary:i,secondary:t,accent:e,text:n}),Yu=[{id:"BAL",city:"Baltimore",name:"Orioles",league:"AL",division:"East",colors:te("#DF4601","#000000"),stadiumId:"camden",roster:Su},{id:"BOS",city:"Boston",name:"Red Sox",league:"AL",division:"East",colors:te("#BD3039","#0C2340"),stadiumId:"fenway",roster:xu},{id:"NYY",city:"New York",name:"Yankees",league:"AL",division:"East",colors:te("#0C2340","#C4CED3"),stadiumId:"yankee",roster:_u},{id:"TB",city:"Tampa Bay",name:"Rays",league:"AL",division:"East",colors:te("#092C5C","#8FBCE6","#F5D130"),stadiumId:"tropicana",roster:yu},{id:"TOR",city:"Toronto",name:"Blue Jays",league:"AL",division:"East",colors:te("#134A8E","#1D2D5C","#E8291C"),stadiumId:"rogers",roster:Mu},{id:"CWS",city:"Chicago",name:"White Sox",league:"AL",division:"Central",colors:te("#27251F","#C4CED4"),stadiumId:"ratefield",roster:bu},{id:"CLE",city:"Cleveland",name:"Guardians",league:"AL",division:"Central",colors:te("#00385D","#E50022"),stadiumId:"progressive",roster:Ru},{id:"DET",city:"Detroit",name:"Tigers",league:"AL",division:"Central",colors:te("#0C2340","#FA4616"),stadiumId:"comerica",roster:wu},{id:"KC",city:"Kansas City",name:"Royals",league:"AL",division:"Central",colors:te("#004687","#BD9B60"),stadiumId:"kauffman",roster:Eu},{id:"MIN",city:"Minnesota",name:"Twins",league:"AL",division:"Central",colors:te("#002B5C","#D31145","#B9975B"),stadiumId:"target",roster:Tu},{id:"HOU",city:"Houston",name:"Astros",league:"AL",division:"West",colors:te("#002D62","#EB6E1F"),stadiumId:"daikin",roster:Cu},{id:"LAA",city:"Los Angeles",name:"Angels",league:"AL",division:"West",colors:te("#BA0021","#003263","#C4CED4"),stadiumId:"angel",roster:Au},{id:"ATH",city:"Sacramento",name:"Athletics",league:"AL",division:"West",colors:te("#003831","#EFB21E"),stadiumId:"sutter",roster:Lu},{id:"SEA",city:"Seattle",name:"Mariners",league:"AL",division:"West",colors:te("#0C2C56","#005C5C","#C4CED4"),stadiumId:"tmobile",roster:Pu},{id:"TEX",city:"Texas",name:"Rangers",league:"AL",division:"West",colors:te("#003278","#C0111F"),stadiumId:"globelife",roster:Fu},{id:"ATL",city:"Atlanta",name:"Braves",league:"NL",division:"East",colors:te("#13274F","#CE1141"),stadiumId:"truist",roster:Iu},{id:"MIA",city:"Miami",name:"Marlins",league:"NL",division:"East",colors:te("#00A3E0","#EF3340","#000000"),stadiumId:"loandepot",roster:Du},{id:"NYM",city:"New York",name:"Mets",league:"NL",division:"East",colors:te("#002D72","#FF5910"),stadiumId:"citi",roster:Bu},{id:"PHI",city:"Philadelphia",name:"Phillies",league:"NL",division:"East",colors:te("#E81828","#002D72"),stadiumId:"cbp",roster:Uu},{id:"WSH",city:"Washington",name:"Nationals",league:"NL",division:"East",colors:te("#AB0003","#14225A"),stadiumId:"natspark",roster:Nu},{id:"CHC",city:"Chicago",name:"Cubs",league:"NL",division:"Central",colors:te("#0E3386","#CC3433"),stadiumId:"wrigley",roster:Ou},{id:"CIN",city:"Cincinnati",name:"Reds",league:"NL",division:"Central",colors:te("#C6011F","#000000"),stadiumId:"gabp",roster:zu},{id:"MIL",city:"Milwaukee",name:"Brewers",league:"NL",division:"Central",colors:te("#12284B","#FFC52F"),stadiumId:"amfam",roster:ku},{id:"PIT",city:"Pittsburgh",name:"Pirates",league:"NL",division:"Central",colors:te("#27251F","#FDB827"),stadiumId:"pnc",roster:Hu},{id:"STL",city:"St. Louis",name:"Cardinals",league:"NL",division:"Central",colors:te("#C41E3A","#0C2340","#FEDB00"),stadiumId:"busch",roster:Gu},{id:"ARI",city:"Arizona",name:"Diamondbacks",league:"NL",division:"West",colors:te("#A71930","#E3D4AD","#30CED8"),stadiumId:"chase",roster:Vu},{id:"COL",city:"Colorado",name:"Rockies",league:"NL",division:"West",colors:te("#33006F","#C4CED4"),stadiumId:"coors",roster:Wu},{id:"LAD",city:"Los Angeles",name:"Dodgers",league:"NL",division:"West",colors:te("#005A9C","#EF3E42"),stadiumId:"dodger",roster:$u},{id:"SD",city:"San Diego",name:"Padres",league:"NL",division:"West",colors:te("#2F241D","#FFC425"),stadiumId:"petco",roster:Xu},{id:"SF",city:"San Francisco",name:"Giants",league:"NL",division:"West",colors:te("#FD5A1E","#27251F","#EFD19F"),stadiumId:"oracle",roster:qu}],ye={FF:{code:"FF",name:"4-Seam Fastball",short:"4SFB",speed:1,hb:7,ivb:16,late:2,spin:2350,color:"#ff5a4f",fastball:!0},FT:{code:"FT",name:"2-Seam Fastball",short:"2SFB",speed:.98,hb:15,ivb:9,late:2.2,spin:2200,color:"#ff8a3d",fastball:!0},SI:{code:"SI",name:"Sinker",short:"SNK",speed:.975,hb:15,ivb:5,late:2.3,spin:2150,color:"#ffae3d",fastball:!0},FC:{code:"FC",name:"Cutter",short:"CUT",speed:.94,hb:-4,ivb:9,late:3,spin:2400,color:"#ffd23d",fastball:!0},SL:{code:"SL",name:"Slider",short:"SL",speed:.88,hb:-7,ivb:1,late:2.7,spin:2450,color:"#3dd6ff",fastball:!1},ST:{code:"ST",name:"Sweeper",short:"SWP",speed:.86,hb:-16,ivb:1,late:2.4,spin:2600,color:"#3d8bff",fastball:!1},CU:{code:"CU",name:"Curveball",short:"CB",speed:.81,hb:-8,ivb:-13,late:2.2,spin:2600,color:"#a66bff",fastball:!1},KC:{code:"KC",name:"Knuckle Curve",short:"KC",speed:.84,hb:-6,ivb:-11,late:2.4,spin:2500,color:"#d06bff",fastball:!1},CH:{code:"CH",name:"Changeup",short:"CH",speed:.885,hb:14,ivb:5,late:2.4,spin:1750,color:"#4fff8a",fastball:!1},FS:{code:"FS",name:"Splitter",short:"SPL",speed:.9,hb:8,ivb:0,late:3.4,spin:1300,color:"#3dffd0",fastball:!1}},Ya=["A","S","D","F","G","H"],ln=i=>Math.max(1,Math.min(99,Math.round(i)));function nh(i,t){return`${i}-${t.toLowerCase().normalize("NFD").replace(/[^a-z0-9]+/g,"-")}`}function Ju(i){const[,,t,e,,n,s,r,a,o,l,,c]=i;let u=n,h=n,d=s,f=s;return e==="L"?(u=n+3,h=n-7,d=s+2,f=s-7):e==="R"&&(u=n-2,h=n+4,d=s-1,f=s+3),{...{contactR:ln(u),contactL:ln(h),powerR:ln(d),powerL:ln(f),vision:ln(r*.7+n*.3),discipline:ln(r),speed:ln(a),stealing:ln(a*.85+r*.1+4),fielding:ln(o),arm:ln(l),reaction:ln(o*.6+a*.25+(t==="C"?10:8))},...c??{}}}function Ku(i,t){const[e,n,s,r,a,,,,,,,o]=t;return{id:nh(i,e),teamId:i,name:e,number:n,pos:s,secondary:o?o.split(",").map(l=>l.trim()):[],bats:r,throws:a,ratings:Ju(t)}}function Zu(i,t,e){const[n,s,r,a,o,l,c,u,h]=t,d=h.split(",").map(g=>g.trim()).filter(g=>g in ye),f={velocity:o,control:l,break:c,stamina:u,pitches:d,role:r};return e?(e.pitcher=f,e):{id:nh(i,n),teamId:i,name:n,number:s,pos:"P",secondary:[],bats:a==="L"?"L":"R",throws:a,ratings:{contactR:12,contactL:12,powerR:10,powerL:10,vision:15,discipline:15,speed:35,stealing:10,fielding:55+Math.round(l/10),arm:Math.min(99,o-15),reaction:55},pitcher:f}}function ju(i,t){const e=t.hitters.map(r=>Ku(i,r)),n=new Map(e.map(r=>[r.name,r])),s=[];for(const r of t.pitchers){const a=n.get(r[0]),o=Zu(i,r,a);a||s.push(o)}return[...e,...s]}function Zo(i,t){return t==="DH"?!0:t==="P"?!!i.pitcher:i.pos===t||i.secondary.includes(t)?!0:t==="1B"?i.pos!=="C"||i.secondary.includes("1B"):["LF","RF"].includes(t)?["LF","CF","RF"].includes(i.pos):!1}function Qu(i,t){return t==="DH"||i.pos===t||i.secondary.includes(t)?0:Zo(i,t)?8:t==="C"?35:t==="SS"||t==="CF"?22:15}const Vn=Yu.map(i=>({id:i.id,city:i.city,name:i.name,league:i.league,division:i.division,colors:i.colors,stadiumId:i.stadiumId,roster:ju(i.id,i.roster)})),Ze=Object.fromEntries(Vn.map(i=>[i.id,i])),ih=new Map;for(const i of Vn)for(const t of i.roster)ih.set(t.id,t);function Qe(i){const t=ih.get(i);if(!t)throw new Error(`Unknown player ${i}`);return t}function zr(i){return i.roster.filter(t=>t.pos!=="P")}function sh(i){return i.roster.filter(t=>!!t.pitcher)}function kr(i){return sh(i).filter(t=>t.pitcher.role==="SP")}function rh(i){return sh(i).filter(t=>t.pitcher.role!=="SP")}const yi=i=>i.length?i.reduce((t,e)=>t+e,0)/i.length:0;function bl(i){const t=Ja(i).map(h=>Qe(h.playerId)),e=yi(t.map(h=>(h.ratings.contactR+h.ratings.contactL)/2)),n=yi(t.map(h=>(h.ratings.powerR+h.ratings.powerL)/2)),s=yi(t.map(h=>h.ratings.speed)),r=yi(t.filter((h,d)=>Ja(i)[d].pos!=="DH").map(h=>(h.ratings.fielding*2+h.ratings.arm)/3)),a=h=>{const d=h.pitcher;return(d.control+d.break+(d.velocity-80)*3.2)/3},o=yi(kr(i).map(a)),l=yi(rh(i).map(a)),c=(h,d,f)=>Math.round(Math.max(40,Math.min(99,40+(h-d)/(f-d)*59))),u={contact:c(e,55,76),power:c(n,50,76),speed:c(s,42,70),defense:c(r,58,80),starting:c(o,60,80),bullpen:c(l,62,80),overall:0};return u.overall=Math.round((u.contact+u.power+u.speed*.5+u.defense*.8+u.starting*1.2+u.bullpen*.6)/5.1),u}function Ja(i){return zr(i).slice(0,9).map(t=>({playerId:t.id,pos:t.pos}))}function sa(i,t=0){const e=kr(i);return{teamId:i.id,lineup:Ja(i),startingPitcherId:e[t%e.length].id}}const Xt=(i,t,e)=>i<t?t:i>e?e:i,td=Math.PI/180,ss=1.46667,Yi=32.174,qn=(i,t)=>Math.atan2(i,t)/td;class ed{constructor(t=Math.random()*2**32>>>0){I(this,"s");this.s=t>>>0}next(){let t=this.s+=1831565813;return t=Math.imul(t^t>>>15,t|1),t^=t+Math.imul(t^t>>>7,t|61),((t^t>>>14)>>>0)/4294967296}range(t,e){return t+(e-t)*this.next()}chance(t){return this.next()<t}gauss(t=1,e=0){const n=Math.max(1e-9,this.next()),s=this.next();return e+t*Math.sqrt(-2*Math.log(n))*Math.cos(2*Math.PI*s)}pick(t){return t[Math.floor(this.next()*t.length)]}weighted(t,e){let n=0;for(const r of e)n+=Math.max(0,r);let s=this.next()*n;for(let r=0;r<t.length;r++)if(s-=Math.max(0,e[r]),s<=0)return t[r];return t[t.length-1]}}const ah=[{id:"camden",name:"Oriole Park at Camden Yards",city:"Baltimore",dims:[333,376,400,373,318],walls:[13,13,8,10,25],altitude:30,foulWidth:40,backstop:58,wallColor:"#1e3d2a",seatColor:"#2d5a3c",feature:"B&O Warehouse beyond right field"},{id:"fenway",name:"Fenway Park",city:"Boston",dims:[310,379,390,380,302],walls:[37,17,17,5,3],wallZones:[{from:-46,to:-14,h:37}],altitude:20,foulWidth:22,backstop:60,wallColor:"#24533a",seatColor:"#2a6040",feature:"The Green Monster (37-ft wall in left)"},{id:"yankee",name:"Yankee Stadium",city:"New York",dims:[318,399,408,385,314],walls:[8,8,8,8,8],altitude:55,foulWidth:38,backstop:52,wallColor:"#18263f",seatColor:"#1c3b74",feature:"Short right-field porch"},{id:"tropicana",name:"Tropicana Field",city:"St. Petersburg",dims:[315,370,404,370,322],walls:[11,10,9,10,11],altitude:45,foulWidth:42,backstop:50,wallColor:"#1d3b66",seatColor:"#244d8a",roof:"dome"},{id:"rogers",name:"Rogers Centre",city:"Toronto",dims:[328,368,400,359,328],walls:[14,12,10,12,14],altitude:250,foulWidth:40,backstop:60,wallColor:"#13366b",seatColor:"#1b4f9c",roof:"retractable"},{id:"ratefield",name:"Rate Field",city:"Chicago",dims:[330,377,400,372,335],walls:[8,8,8,8,8],altitude:595,foulWidth:40,backstop:58,wallColor:"#1d1d1f",seatColor:"#1f3d2b"},{id:"progressive",name:"Progressive Field",city:"Cleveland",dims:[325,370,405,375,325],walls:[19,19,9,9,9],altitude:650,foulWidth:36,backstop:60,wallColor:"#1d3049",seatColor:"#2d4870",feature:"19-ft wall in left"},{id:"comerica",name:"Comerica Park",city:"Detroit",dims:[345,370,412,365,330],walls:[7,8,8,8,8],altitude:600,foulWidth:44,backstop:64,wallColor:"#1c2b3e",seatColor:"#26384f",feature:"Deep center field"},{id:"kauffman",name:"Kauffman Stadium",city:"Kansas City",dims:[347,387,410,387,347],walls:[8,8,8,8,8],altitude:750,foulWidth:45,backstop:60,wallColor:"#1a3d6b",seatColor:"#1f5aa0",feature:"Spacious, symmetrical outfield"},{id:"target",name:"Target Field",city:"Minneapolis",dims:[339,377,404,367,328],walls:[8,8,8,16,23],altitude:815,foulWidth:38,backstop:60,wallColor:"#1c2c45",seatColor:"#213a63",feature:"23-ft wall in right"},{id:"daikin",name:"Daikin Park",city:"Houston",dims:[315,362,409,373,326],walls:[21,21,10,7,7],wallZones:[{from:-46,to:-16,h:21}],altitude:45,foulWidth:35,backstop:49,wallColor:"#1b2a44",seatColor:"#2b3f66",roof:"retractable",feature:"Crawford Boxes in left"},{id:"angel",name:"Angel Stadium",city:"Anaheim",dims:[347,390,396,370,350],walls:[8,8,8,18,18],altitude:160,foulWidth:42,backstop:60,wallColor:"#183049",seatColor:"#25456b"},{id:"sutter",name:"Sutter Health Park",city:"West Sacramento",dims:[330,388,403,388,325],walls:[8,8,8,8,8],altitude:25,foulWidth:34,backstop:55,wallColor:"#1a3a2a",seatColor:"#21523a",feature:"Intimate minor-league-sized park"},{id:"tmobile",name:"T-Mobile Park",city:"Seattle",dims:[331,378,401,381,326],walls:[8,8,8,8,8],altitude:20,foulWidth:40,backstop:60,wallColor:"#122b3a",seatColor:"#1a4b5c",roof:"retractable",feature:"Heavy marine air"},{id:"globelife",name:"Globe Life Field",city:"Arlington",dims:[329,372,407,374,326],walls:[8,8,8,8,8],altitude:550,foulWidth:40,backstop:50,wallColor:"#162a52",seatColor:"#213c74",roof:"retractable"},{id:"truist",name:"Truist Park",city:"Atlanta",dims:[335,385,400,375,325],walls:[11,11,8,16,16],altitude:1e3,foulWidth:38,backstop:54,wallColor:"#182a48",seatColor:"#23406e",feature:"Chop House in right"},{id:"loandepot",name:"loanDepot park",city:"Miami",dims:[344,386,400,387,335],walls:[12,12,8,8,10],altitude:10,foulWidth:42,backstop:47,wallColor:"#12293d",seatColor:"#1f6f8b",roof:"retractable"},{id:"citi",name:"Citi Field",city:"New York",dims:[335,370,408,375,330],walls:[8,8,8,8,8],altitude:15,foulWidth:42,backstop:60,wallColor:"#141c2b",seatColor:"#1d3570"},{id:"cbp",name:"Citizens Bank Park",city:"Philadelphia",dims:[329,374,401,369,330],walls:[11,11,6,13,13],altitude:20,foulWidth:40,backstop:60,wallColor:"#1d2a3d",seatColor:"#2b4a7a",feature:"Hitter-friendly bandbox"},{id:"natspark",name:"Nationals Park",city:"Washington",dims:[337,377,402,370,335],walls:[8,8,8,14,14],altitude:25,foulWidth:40,backstop:59,wallColor:"#1b2238",seatColor:"#1f2f62"},{id:"wrigley",name:"Wrigley Field",city:"Chicago",dims:[355,368,400,368,353],walls:[12,12,12,12,12],altitude:595,foulWidth:24,backstop:60,wallColor:"#24502b",seatColor:"#2a5f8a",feature:"Ivy-covered brick walls; wind off the lake"},{id:"gabp",name:"Great American Ball Park",city:"Cincinnati",dims:[328,379,404,370,325],walls:[12,12,8,8,8],altitude:490,foulWidth:38,backstop:55,wallColor:"#1c1c1f",seatColor:"#8a2329",feature:"Launching pad"},{id:"amfam",name:"American Family Field",city:"Milwaukee",dims:[344,371,400,374,345],walls:[8,8,8,8,8],altitude:635,foulWidth:40,backstop:56,wallColor:"#13243d",seatColor:"#1e3b6b",roof:"retractable"},{id:"pnc",name:"PNC Park",city:"Pittsburgh",dims:[325,389,399,375,320],walls:[6,10,10,10,21],altitude:730,foulWidth:36,backstop:51,wallColor:"#1c1c1f",seatColor:"#2b2b2f",feature:"21-ft Clemente Wall; deep left-center"},{id:"busch",name:"Busch Stadium",city:"St. Louis",dims:[336,375,400,375,335],walls:[8,8,8,8,8],altitude:465,foulWidth:42,backstop:52,wallColor:"#183020",seatColor:"#9b1d26"},{id:"chase",name:"Chase Field",city:"Phoenix",dims:[330,374,407,374,334],walls:[8,8,25,8,8],altitude:1080,foulWidth:40,backstop:50,wallColor:"#1f1f22",seatColor:"#6a1d2b",roof:"retractable",feature:"Center-field pool"},{id:"coors",name:"Coors Field",city:"Denver",dims:[347,390,415,375,350],walls:[8,8,8,14,14],altitude:5200,foulWidth:44,backstop:56,wallColor:"#1d2d22",seatColor:"#3c2b5c",feature:"Mile-high thin air; huge outfield"},{id:"dodger",name:"Dodger Stadium",city:"Los Angeles",dims:[330,375,395,375,330],walls:[4,8,8,8,4],altitude:515,foulWidth:46,backstop:55,wallColor:"#142a52",seatColor:"#e0b53a",feature:"Pitcher-friendly night air"},{id:"petco",name:"Petco Park",city:"San Diego",dims:[336,390,396,391,322],walls:[8,8,8,8,8],altitude:20,foulWidth:42,backstop:45,wallColor:"#2b2620",seatColor:"#1d3c63",feature:"Western Metal Supply building in left"},{id:"oracle",name:"Oracle Park",city:"San Francisco",dims:[339,364,391,415,309],walls:[8,8,8,20,24],altitude:10,foulWidth:40,backstop:48,wallColor:"#1c2b22",seatColor:"#2b4c37",feature:"Triples Alley in right-center; 24-ft arcade wall"}],Vi=Object.fromEntries(ah.map(i=>[i.id,i])),Hr=[-45,-22.5,0,22.5,45];function nd(i,t){const e=Math.max(-45,Math.min(45,t));for(let n=0;n<4;n++)if(e<=Hr[n+1]){const s=(e-Hr[n])/22.5,r=(1-Math.cos(s*Math.PI))/2;return i[n]+(i[n+1]-i[n])*r}return i[4]}function Oe(i,t){return nd(i.dims,t)}function oi(i,t){if(i.wallZones){for(const n of i.wallZones)if(t>=n.from&&t<=n.to)return n.h}const e=Math.max(-45,Math.min(45,t));for(let n=0;n<4;n++)if(e<=Hr[n+1]){const s=(e-Hr[n])/22.5;return i.walls[n]+(i.walls[n+1]-i.walls[n])*s}return i.walls[4]}const Hn=.121,id=.005473,ra=.37,sd=.62;function rd(i,t){const e=Math.exp(-i.altitude/27e3),n=(459.67+70)/(459.67+t.temperature),s=t.weather==="Light Rain"?1.015:1,a=i.roof==="dome"?0:t.windMph*ss,o=t.windDir*Math.PI/180;return{rho:e*n*s,wind:{x:Math.sin(o)*a,y:0,z:Math.cos(o)*a},stadium:i}}const Rl=(i,t)=>{const e=Hn*Math.abs(i)*2*Math.PI/60/Math.max(20,t);return sd*e/(2.32*e+.4)};function wl(i,t,e){if(Math.hypot(i,t-60.5)<95&&t>-10){const a=(i+t)/Math.SQRT2,o=(t-i)/Math.SQRT2;return!(a>6&&o>6&&a<84&&o<84&&Math.hypot(i,t-60.5)>9)}const s=qn(i,t),r=Math.hypot(i,t);return Math.abs(s)<=45&&r>Oe(e,s)-15}function Gr(i,t,e){if(i.stopped)return null;const n=e.stadium;let s=null;if(i.rolling){const o=Math.hypot(i.v.x,i.v.z),c=(wl(i.p.x,i.p.z,n)?9:12)+o*.06;o<=c*t?(i.v.x=0,i.v.z=0,i.stopped=!0,s="stopped"):(i.v.x-=i.v.x/o*c*t,i.v.z-=i.v.z/o*c*t),i.p.x+=i.v.x*t,i.p.z+=i.v.z*t,i.p.y=Hn}else{const o={x:i.v.x-e.wind.x*Math.min(1,i.p.y/20),y:i.v.y,z:i.v.z-e.wind.z*Math.min(1,i.p.y/20)},l=Math.hypot(o.x,o.y,o.z)||1,c=id*e.rho;let u=-c*ra*l*o.x,h=-c*ra*l*o.y-Yi,d=-c*ra*l*o.z;const f=o.x/l,g=o.y/l,v=o.z/l;let m=-g*f,p=1-g*g,M=-g*v;const b=Math.hypot(m,p,M)||1;m/=b,p/=b,M/=b;const x=c*Rl(i.backspin,l)*l*l*Math.sign(i.backspin);u+=m*x,h+=p*x,d+=M*x;const E=Math.hypot(f,v)||1,T=v/E,C=-f/E,A=c*Rl(i.sidespin,l)*l*l*Math.sign(i.sidespin);u+=T*A,d+=C*A,i.v.x+=u*t,i.v.y+=h*t,i.v.z+=d*t,i.p.x+=i.v.x*t,i.p.y+=i.v.y*t,i.p.z+=i.v.z*t;const _=Math.exp(-t/30);if(i.backspin*=_,i.sidespin*=_,i.p.y<=Hn&&i.v.y<0){i.p.y=Hn;const y=wl(i.p.x,i.p.z,n);if(Math.abs(i.v.y)>5){const L=y?.48:.4;i.v.y=-i.v.y*L;const U=y?.8:.72;i.v.x*=U,i.v.z*=U,i.backspin*=.2,i.sidespin*=.2,i.bounces++,s="bounce"}else i.v.y=0,i.rolling=!0,i.backspin=0,i.sidespin=0,i.bounces++,s="bounce"}}const r=Math.hypot(i.p.x,i.p.z),a=qn(i.p.x,i.p.z);if(Math.abs(a)<=45&&i.p.z>0){const o=Oe(n,a);if(r>=o-Hn){const l=oi(n,a);if(i.p.y>l)return"homerun";const c=i.p.x/r,u=i.p.z/r,h=i.v.x*c+i.v.z*u;h>0&&(i.v.x-=1.4*h*c,i.v.z-=1.4*h*u,i.v.x*=.85,i.v.z*=.85,i.v.y*=.8);const d=o-Hn-.2;return i.p.x=c*d,i.p.z=u*d,"wall"}}else{const o=(i.p.x-i.p.z)*Math.SQRT1_2,l=(-i.p.x-i.p.z)*Math.SQRT1_2,c=Math.max(o,l),u=i.p.z<0&&r>n.backstop;if(c>n.foulWidth||u)return i.p.y>4||r>420?"outofplay":(i.v.x*=-.3,i.v.z*=-.3,i.p.x*=.995,i.p.z*=.995,"wall")}return s}function ad(i,t,e=9,n=1/60){const s={...i,p:{...i.p},v:{...i.v}},r=[{t:0,x:s.p.x,y:s.p.y,z:s.p.z,rolling:s.rolling,event:null}];let a=0;const o=4;for(;a<e;){let l=null;for(let c=0;c<o;c++){const u=Gr(s,n/o,t);if(u&&!l&&(l=u),u==="homerun"||u==="outofplay")break}if(a+=n,r.push({t:a,x:s.p.x,y:s.p.y,z:s.p.z,rolling:s.rolling,event:l}),l==="homerun"||l==="outofplay"||s.stopped)break}return r}function od(i,t,e,n,s,r){const a=t*ss,o=e*Math.PI/180,l=n*Math.PI/180;return{p:{...i},v:{x:a*Math.cos(o)*Math.sin(l),y:a*Math.sin(o),z:a*Math.cos(o)*Math.cos(l)},backspin:s,sidespin:r,rolling:!1,bounces:0,stopped:!1}}const ws=.71,Ji=1.4,El=-2.4,Wi={halfWidth:.708+.121,bottom:1.55-.121,top:3.45+.121},Ki=(1.55+3.45)/2,ld=i=>i.throws==="R"?-1:1;function As(i,t){const e=Math.pow(Math.max(0,t)/i.T,i.late);return{x:i.release.x+i.v0.x*t+i.dev.x*e,y:i.release.y+i.v0.y*t-.5*Yi*t*t+i.dev.y*e,z:i.release.z+i.v0.z*t+.5*i.az*t*t}}function Ls(i,t){const e=.5*i.az,n=i.v0.z,s=i.release.z-t;if(Math.abs(e)<1e-9)return-s/n;const r=n*n-4*e*s,a=Math.sqrt(Math.max(0,r)),o=(-n-a)/(2*e),l=(-n+a)/(2*e);return[o,l].filter(u=>u>0).sort((u,h)=>u-h)[0]??i.T}function oh(i,t){return Math.abs(i)<=Wi.halfWidth&&t>=Wi.bottom&&t<=Wi.top}function cd(i,t,e,n,s){const r=i.pitcher,a=ye[e.code],o=ld(i),l=Xt(n-.6,0,1),c=r.velocity*a.speed-l*4+s.gauss(.6),u=c*ss,h={x:o*1.75,y:5.9-(e.code==="SI"?.2:0),z:54},d=h.z-ws,f=d/(.95*u),g=-d/(.95*f),v=-.1*g/f,m=a.fastball?.85+r.break/330:.68+r.break/160,p=1-l*.25,M={x:a.hb*o/12*m*p*(1+s.gauss(.06)),y:a.ivb/12*m*p*(1+s.gauss(.06)),z:0},b=r.control/100,x=(.09+(1-b)*.24)*(1+l*1.3),E=Xt(e.meterError,-1.2,1.2);let T=e.target.x+s.gauss(x),C=e.target.y+s.gauss(x);const A=Math.abs(E)*(1.15-b*.45);E<0?(C+=A*1,T+=o*A*.45):E>0&&(C-=A*1.2,T-=o*A*.35),T=Xt(T,-4.2,4.2),C=Xt(C,-.6,6.5);const _={x:(T-h.x-M.x)/f,y:(C-h.y+.5*Yi*f*f-M.y)/f,z:g},L=T*(t==="R"?-1:1)>1.95&&C>.4&&C<5.6;return{code:e.code,mph:c,release:h,v0:_,az:v,dev:M,late:a.late,T:f,target:{...e.target},plate:{x:T,y:C},isStrike:oh(T,C),hitsBatter:L,wild:C<.55||Math.abs(T)>2.6||C>5.4}}const Vr=.14;function Wr(i,t){return i.bats==="S"?t.throws==="R"?"L":"R":i.bats}function lh(i,t,e){const n=i.ratings.vision,s=t==="contact"?1.25:t==="power"?.78:1;return .29*(.72+n/180)*s*e.pci}function hd(i,t,e,n){const s=t.throws==="R"?i.ratings.contactR:i.ratings.contactL,r=e==="contact"?1.2:e==="power"?.85:1,a=(.78+s/240)*r*n.timing;return{perfect:.011*a,good:.026*a,ok:.048*a,very:.075*a,max:.1*a}}function ud(i,t,e,n,s,r){const a=Wr(i,t),o=Ls(e,Ji),l=n.pressTime+Vr,c=l-o,u=hd(i,t,n.type,s),h=Math.abs(c);let d;h<=u.perfect?d="PERFECT":h<=u.good?d="GOOD":h<=u.ok?d=c<0?"EARLY":"LATE":d=c<0?"VERY EARLY":"VERY LATE";const f=As(e,Xt(l,0,e.T*1.2)),g=As(e,o),v=lh(i,n.type,s),m=g.x-n.pci.x,p=g.y-n.pci.y,M=Math.hypot(m,p),b=v+.121,x={contact:!1,timing:d,timingMs:c*1e3,label:"MISS",quality:0,ev:0,la:0,spray:0,backspin:0,sidespin:0,contactPoint:{x:f.x,y:f.y,z:f.z},pciDist:M};if(M>b||h>u.max)return x;const E=Xt(1-M/b,0,1),T=h<=u.perfect?1:Xt(1-(h-u.perfect)/(u.max-u.perfect)*.85,0,1),C=Math.pow(E,.85)*T;let A;C<.12||C<.24&&r.chance(.55)?A="FOUL":C<.3?A="WEAK":C<.5?A="OKAY":C<.72?A="GOOD":d==="PERFECT"&&E>.82?A="PERFECT-PERFECT":A="BARRELED";const y=99+(t.throws==="R"?i.ratings.powerR:i.ratings.powerL)*.17+(n.type==="power"?3.5:n.type==="contact"?-5:0),L=ye[e.code];let U=50+(y-50)*Math.pow(C,.5)+(e.mph-90)*.18+r.gauss(1.4);A==="PERFECT-PERFECT"&&(U+=2),U=Xt(U,30,121);let $=11+p/v*36+(n.type==="power"?4:n.type==="contact"?-3:0)+r.gauss(4+(1-C)*6);(e.code==="SI"||e.code==="FT")&&($-=4),e.code==="FF"&&e.plate.y>3.2&&($+=3),L.ivb<-5&&($-=2),$=Xt($,-70,85);const X=a==="R"?-1:1,q=(a==="R"?-g.x:g.x)/.83,Z=Xt(-c/.032,-2.6,2.6)+q*.32;let W=X*Z*27+r.gauss(6+(1-C)*14);A==="FOUL"&&(W=r.chance(.5)?180+r.gauss(30):X*(60+r.range(0,60)),$=r.range(-10,70),U=r.range(45,70));const rt=$>0?Xt(900+$*50+C*300,600,3200):Xt(-600+$*15,-1800,-200),ut=X*Z*260*(1-C*.5);return{contact:!0,timing:d,timingMs:c*1e3,label:A,quality:C,ev:U,la:$,spray:W,backspin:rt,sidespin:ut,contactPoint:{x:g.x,y:g.y,z:Ji},pciDist:M}}const cs=90/Math.SQRT2,Ka=[{x:0,z:0},{x:cs,z:cs},{x:0,z:2*cs},{x:-cs,z:cs},{x:0,z:0}],Xs=["HOME","1ST","2ND","3RD","HOME"];function hi(i){const t=Math.max(0,Math.min(360,i)),e=Math.min(3,Math.floor(t/90)),n=(t-e*90)/90,s=Ka[e],r=Ka[e+1];return{x:s.x+(r.x-s.x)*n,z:s.z+(r.z-s.z)*n}}function Ge(i){return Ka[Math.max(0,Math.min(4,i))]}const hs=(i,t)=>({x:Math.sin(i*Math.PI/180)*t,z:Math.cos(i*Math.PI/180)*t});function ch(i){const t=e=>hs(e,Math.min(Oe(i,e)*.79,335));return{P:{x:0,z:58},C:{x:0,z:-3.2},"1B":hs(38,110),"2B":hs(14,148),SS:hs(-13,148),"3B":hs(-35,110),LF:t(-27),CF:t(0),RF:t(27)}}const hh=["P","C","1B","2B","3B","SS","LF","CF","RF"],Cr=30;function dd(i){return 23+i.ratings.speed*.065}function Tl(i,t,e,n,s,r){const a=dd(i);return{id:i.id,player:i,p:r??t*90,startBase:t,goal:t*90,top:a,v:r!==void 0&&r>t*90+20?a*.85:r!==void 0&&r>t*90?6:0,delay:0,lastTouched:t,out:!1,scored:!1,scoreTime:0,mustRetag:!1,manual:!1,isBatter:s,slide:0,responsiblePitcherId:e,reachedOnError:n,thinkCd:0,trot:!1}}function _n(i){const t=Math.round(i.p/90);return Math.abs(i.p-t*90)<.6}function Ar(i,t,e=!0){const n=i.ball,s=Ge(t),r=e?.28:.05;if(n.mode==="dead")return 1/0;if(n.mode==="held"&&n.holder){const h=n.holder,d=Math.hypot(h.x-s.x,h.z-s.z)/h.speed,f=Math.hypot(h.x,h.z)>170,g=Math.max(0,(f?.85:.6)-h.holdTime);return Math.min(d,g+Za(h,s))+r}if(n.mode==="thrown"){const h=Math.hypot(n.phys.v.x,n.phys.v.z)||1,d=Math.hypot(n.throwTarget.x-n.phys.p.x,n.throwTarget.z-n.phys.p.z)/h;if(n.throwBase===t)return d+r;const f=Ge(n.throwBase);return d+.45+Math.hypot(f.x-s.x,f.z-s.z)/120+r}const a=i.intercept;if(!a)return 6;const o=Math.max(0,a.tAbs-i.t),l=a.f;Math.hypot(a.x-s.x,a.z-s.z);const c=Math.hypot(a.x,a.z)>170,u=(a.air?.2:.35)+(c?.85:.6);return o+u+Za({...l,x:a.x,z:a.z},s)+r}function Lr(i,t){const e=Math.abs(t*90-i.p),n=i.v,s=Math.max(0,(i.top-n)/Cr),r=n*s+.5*Cr*s*s;return r>=e?Math.sqrt(2*e/Cr)+Math.max(0,i.delay):s+(e-r)/i.top+Math.max(0,i.delay)}function Cl(i,t,e){return i.activeRunners().find(n=>n!==e&&(Math.abs(n.p-t*90)<.6||n.goal===t*90&&n.p>(t-1)*90))}function fd(i){return i.cfg.userOffense?.15:.26-Hs[i.cfg.difficulty]*.035+i.cfg.rng.gauss(.08)}function uh(i,t){if(t.manual||t.trot||t.out||t.scored)return;const e=i.ball,n=i.totalOuts()>=2,s=!i.cfg.userOffense||i.cfg.runningAssist,r=i.isForced(t)&&t.lastTouched<t.startBase+1?t.startBase+1:0;if(t.mustRetag){t.goal=t.startBase*90;return}if(!s){t.isBatter&&t.goal<90&&(t.goal=90),r&&t.goal<r*90&&(t.goal=r*90);return}const a=Math.max(r*90,t.isBatter?90:0);if(e.mode==="loose"&&e.battedInAir){if(n){t.goal=Math.max(t.goal,a,(Math.floor(t.p/90+.001)+1)*90),(_n(t)||Math.abs(t.p-t.goal)<12)&&Pr(i,t);return}if(t.isBatter){t.goal=Math.max(t.goal,90);return}if(i.flyCatchable){const c=i.intercept?Math.hypot(i.intercept.x,i.intercept.z)>240:!1;t.startBase===3||t.startBase===2&&c?t.goal=t.startBase*90:t.goal=t.startBase*90+(r?38:22)}else t.goal=Math.max(a,(t.startBase+1)*90);return}t.goal<a&&(t.goal=a);const o=Math.floor(t.p/90+.001);if(t.goal>t.p+.1){const c=Math.round(t.goal/90);if(c*90===t.goal&&c>r&&c>o&&!(t.isBatter&&c===1)&&Ar(i,c)-Lr(t,c)<-.25&&Math.abs(t.p-c*90)>20&&!Cl(i,o,t)){t.goal=o*90;return}Math.abs(t.p-t.goal)<14&&Pr(i,t);return}if(t.goal%90!==0){const c=Math.ceil(t.p/90),u=Math.floor(t.p/90),h=Ar(i,c)-Lr(t,c),d=Ar(i,u)-Lr(t,u);t.goal=(h>d+.2||r===c)&&!Cl(i,c,t)?c*90:u*90;return}_n(t)&&Pr(i,t)}function Pr(i,t){const n=Math.round(t.goal/90)+1;if(n>4||i.activeRunners().find(c=>c!==t&&c.p>t.p&&c.goal<=n*90&&Math.abs(c.goal-n*90)<.5)||i.activeRunners().find(c=>c!==t&&Math.abs(c.p-n*90)<.6&&c.goal<=c.p+.1))return;const a=i.ball;if(a.mode==="held"&&a.holder&&Math.hypot(a.holder.x,a.holder.z-60)<100)return;const o=i.isForced(t)&&n===t.startBase+1;Ar(i,n,!o)-Lr(t,n)>fd(i)&&(t.goal=n*90)}function pd(i){for(const t of i.runners)t.stealingFlag||uh(i,t)}function md(i,t){const e=i.activeRunners().sort((n,s)=>s.p-n.p);for(const n of e)n.thinkCd-=t,n.thinkCd<=0&&(uh(i,n),n.thinkCd=.15);for(let n=0;n<e.length;n++){const s=e[n];if(s.slide=Math.max(0,s.slide-t),s.out||s.scored)continue;if(s.delay>0){s.delay-=t;continue}if(i.totalOuts()>=3&&!i.homeRun){s.v=0;continue}s.mustRetag&&(s.goal=s.startBase*90);const r=Math.max(s.goal,s.startBase*90),a=r-s.p;if(Math.abs(a)<.01){s.v=0;continue}const o=Math.sign(a),l=s.trot?s.top*.5:o<0?s.top*.92:s.top;s.v=Math.min(l,s.v+Cr*t);const c=s.v*t;let u=Math.abs(a)<=c?r:s.p+o*c;Math.abs(a)<=c&&(s.v*=.5);const h=n>0?e[n-1]:void 0;if(o>0&&h&&!h.out&&!h.scored&&u>h.p-3&&h.p<360&&(u=Math.max(s.p,h.p-3)),o>0)for(let f=Math.floor(s.p/90)+1;f*90<=u+1e-6&&f<=4;f++)f>s.lastTouched&&(s.lastTouched=f,i.emit("touch",{base:f,runner:s.player.name}));o<0&&s.mustRetag&&u<=s.startBase*90+.01&&(u=s.startBase*90,s.mustRetag=!1,s.thinkCd=0),s.p=u;const d=Math.round(s.goal/90);if(o>0&&s.goal%90===0&&Math.abs(s.goal-s.p)<9&&s.slide<=0&&d>=2&&!s.trot){const f=i.ball;(f.mode==="thrown"&&f.throwBase===d||f.mode==="held"&&f.holder&&Math.hypot(f.holder.x-Ge(d).x,f.holder.z-Ge(d).z)<12)&&(s.slide=.55,i.emit("slide"))}s.p>=360&&i.scoreRunner(s)}for(const n of i.activeRunners())!n.mustRetag&&i.caughtFly&&_n(n)&&!n.manual&&n.goal===n.p&&(!i.cfg.userOffense||i.cfg.runningAssist)&&Pr(i,n)}function gd(i,t,e){for(const n of i.activeRunners()){if(n.trot||e!==null&&!vd(n,e))continue;n.manual=!0;const s=Math.floor(n.p/90+.001);if(t>0){let r;n.goal%90!==0?r=Math.ceil(n.p/90):n.goal>n.p+.1?r=Math.round(n.goal/90)+1:r=s+1,n.goal=Math.min(4,r)*90}else{if(n.isBatter&&n.lastTouched<1||i.isForced(n)&&n.lastTouched<n.startBase+1)continue;const r=_n(n)&&n.goal<=n.p+.1?s-1:s;n.goal=Math.max(n.startBase,r)*90}}}function vd(i,t){if(t===0)return i.isBatter;const e=Math.round(i.p/90);return i.startBase===t||_n(i)&&e===t}function Sd(i){const t=new Set,e=i.activeRunners().sort((n,s)=>s.p-n.p);for(const n of e){let s=Math.max(n.startBase,Math.round(n.p/90));for(;t.has(s)&&s>n.startBase;)s--;if(s>=4){n.p=360,i.scoreRunner(n);continue}n.p=s*90,n.goal=n.p,t.add(s)}}const Al={CF:9,LF:8,RF:8,SS:7,"2B":6,"3B":5,"1B":4,P:2,C:1};function dh(i){return(58+i.player.ratings.arm*.37)*ss}function Za(i,t){const e=Math.hypot(i.x-t.x,i.z-t.z);return(Math.hypot(i.x,i.z)>170?.5:i.pos==="C"?.45:.28)+e/(dh(i)*(1-Math.min(.18,e/1800)))}function xd(i,t){const e=i.ball,n=e.path;if(!n.length)return null;const s=i.t-e.pathT0;let r=e.touchedGround;const a=i.cfg.stadium;for(let u=0;u<n.length;u++){const h=n[u];if((h.event==="bounce"||h.rolling)&&(r=!0),h.event==="homerun"||h.event==="outofplay"){if(h.event==="homerun"){const b=qn(h.x,h.z),x=oi(a,b);if(h.y<x+3.2&&!r){const E=h.t-s,T=Math.max(0,Math.hypot(t.x-h.x,t.z-h.z)-2.5);if(Math.max(0,t.react)+T/t.speed<=E)return{f:t,t:E,tAbs:i.t+E,x:h.x,z:h.z,air:!0}}}return null}const d=h.t-s;if(d<0||u%2===1&&u!==n.length-1)continue;const f=Math.hypot(h.x,h.z),g=qn(h.x,h.z),m=Math.abs(g)<=45&&f>Oe(a,g)-8?10.5:7.6;if(h.y>m||t.pos==="C"&&f>45)continue;const p=Math.max(0,Math.hypot(t.x-h.x,t.z-h.z)-2.3);if(Math.max(0,t.react)+p/t.speed<=d)return{f:t,t:d,tAbs:i.t+d,x:h.x,z:h.z,air:!r}}const o=n[n.length-1];if(o.event==="homerun"||o.event==="outofplay"||t.pos==="C"&&Math.hypot(o.x,o.z)>45)return null;const l=Math.hypot(t.x-o.x,t.z-o.z),c=Math.max(Math.max(0,t.react)+l/t.speed,o.t-s);return{f:t,t:c,tAbs:i.t+c,x:o.x,z:o.z,air:!1}}function jo(i){const t=[];for(const s of i.fielders){if(s.down>0||s.hasBall)continue;const r=xd(i,s);r&&t.push(r)}if(!t.length)return i.intercept=null,i.flyCatchable=!1,null;const e=t.filter(s=>s.air);let n;return e.length?(e.sort((s,r)=>Al[r.f.pos]-Al[s.f.pos]||s.t-r.t),n=e[0]):(t.sort((s,r)=>s.t-r.t),n=t[0]),i.intercept=n,i.flyCatchable=i.ball.battedInAir&&e.length>0,n.f}function fh(i,t){const e=i.fielders.find(a=>a.task==="cover"&&a.coverBase===t);if(e)return e;const n=Ge(t);let s=null,r=1/0;for(const a of i.fielders){if(a.hasBall||a.task==="chase"||a.down>0)continue;const o=Math.hypot(a.x-n.x,a.z-n.z);o<r&&(r=o,s=a)}return s&&(s.task="cover",s.coverBase=t),s}function Ps(i){var u;const t=i.chaser,e=(...h)=>h.find(d=>d!==(t==null?void 0:t.pos)&&!i.fielder(d).hasBall)??null;for(const h of i.fielders){if(h===t){h.task="chase";continue}h.hasBall||(h.task="backup",h.coverBase=-1)}const n=((u=i.intercept)==null?void 0:u.x)??i.ball.phys.p.x,s=e("1B","P","2B"),r=n>0?e("SS","2B"):e("2B","SS"),a=e("3B","SS","P"),o=e("C","P"),l=new Set,c=(h,d)=>{if(!h||l.has(h))return;const f=i.fielder(h);f.hasBall||(l.add(h),f.task="cover",f.coverBase=d)};c(s,1),c(r,2),c(a,3),c(o,4),i.fielders.some(h=>h.coverBase===3&&h.task==="cover")||c(e("SS","P"),3)}function _d(i){if(i.ball.mode==="loose")i.chaser=jo(i),Ps(i),i.cfg.userDefense&&(i.controlled=i.chaser);else{i.chaser=null,Ps(i);const t=i.fielder("SS"),e=i.fielder("2B");t.task="cover",t.coverBase=2,e.coverBase===2&&(e.task="cover",e.coverBase=1,i.fielder("1B").task="backup",i.fielder("1B").coverBase=-1),i.cfg.userDefense&&(i.controlled=i.ball.holder)}}function Wn(i,t,e,n,s){const r=t-i.x,a=e-i.z,o=Math.hypot(r,a);if(o<.4)i.vx*=.6,i.vz*=.6,Math.hypot(i.vx,i.vz)<.5&&(i.vx=0,i.vz=0);else{const l=Math.min(n,o*4),c=r/o,u=a/o,h=34*s;i.vx+=Xt(c*l-i.vx,-h,h),i.vz+=Xt(u*l-i.vz,-h,h)}i.x+=i.vx*s,i.z+=i.vz*s}function Ms(i,t,e){const n=t-i.x,s=e-i.z;Math.hypot(n,s)>.5&&(i.facing=Math.atan2(n,s))}function yd(i,t,e){const n=i.ball;if(n.mode==="loose"&&(i.chaseCd-=t,i.chaseCd<=0)){const s=i.chaser;i.chaser=jo(i),i.chaser!==s&&(Ps(i),i.cfg.userDefense&&i.chaser&&(!i.controlled||!i.controlled.hasBall)&&(i.controlled=i.chaser)),i.chaseCd=.25}for(const s of i.fielders){if(s.catchCd=Math.max(0,s.catchCd-t),s.throwAnim=Math.max(0,s.throwAnim-t),s.catchAnim=Math.max(0,s.catchAnim-t),s.react-=t,s.hasBall&&(s.holdTime+=t),s.down>0){s.down-=t,s.vx=0,s.vz=0;continue}if(s.dive>0){s.dive-=t,s.x+=s.diveDir.x*17*t,s.z+=s.diveDir.z*17*t,s.dive<=0&&(s.down=s.hasBall?.35:.8);continue}if(s.jump>0){s.jump-=t,s.vx*=.9,s.vz*=.9,s.x+=s.vx*t,s.z+=s.vz*t;continue}if(i.cfg.userDefense&&i.controlled===s&&!i.homeRun&&!i.foul&&e){const a=e.move,o=Math.hypot(a.x,a.z);if(o>.15&&(i.userMoved=!0),i.userMoved||!i.cfg.fieldingAssist||s.hasBall){const l=s.speed*(e.sprint?1:.84);if(o>.15){const c=s.x+a.x/o*10,u=s.z+a.z/o*10;Wn(s,c,u,l*Math.min(1,o),t),s.facing=Math.atan2(a.x,a.z)}else Wn(s,s.x,s.z,0,t),Ms(s,n.phys.p.x,n.phys.p.z)}else Ll(i,s,t);if(e.dive&&!s.hasBall&&ph(i,s,o>.15?{x:a.x/o,z:a.z/o}:null),e.throwTo&&s.hasBall){const{effort:l,err:c}=Ed(i,s,e.throwMeter);Fr(i,s,e.throwTo,l,c)}continue}Ll(i,s,t)}}function ph(i,t,e){const n=i.cfg.stadium,s=qn(t.x,t.z),r=Math.hypot(t.x,t.z);if(Math.abs(s)<=45&&r>Oe(n,s)-9){t.jump=.6,i.emit("jump");return}let a=e;if(!a){const o=i.ball.phys.p.x-t.x,l=i.ball.phys.p.z-t.z,c=Math.hypot(o,l)||1;a={x:o/c,z:l/c}}t.dive=.42,t.diveDir=a,t.facing=Math.atan2(a.x,a.z),i.emit("dive")}function Ll(i,t,e){const n=i.ball;if(t.react>0&&!t.hasBall&&t.task==="chase"){Ms(t,n.phys.p.x,n.phys.p.z);return}if(t.hasBall){Td(i,t,e);return}if(i.homeRun||i.foul||n.mode==="dead"){Wn(t,t.x,t.z,0,e);return}let s=t.x,r=t.z,a=t.speed;if(t===i.chaser&&n.mode==="loose"&&i.intercept){const o=i.intercept,l=Math.max(0,o.tAbs-i.t),c=Math.min(1,l/3);s=o.x+t.routeErr.x*c,r=o.z+t.routeErr.z*c;const u=Math.hypot(n.phys.p.x-t.x,n.phys.p.z-t.z);if(!n.battedInAir&&u<14&&(s=n.phys.p.x,r=n.phys.p.z),n.battedInAir&&u<9&&n.phys.p.y>7.4&&n.phys.p.y<13){const d=qn(t.x,t.z);Math.abs(d)<=45&&Math.hypot(t.x,t.z)>Oe(i.cfg.stadium,d)-9&&(t.jump=.6,i.emit("jump"))}const h=!["LF","CF","RF"].includes(t.pos);if((n.battedInAir||h)&&u<9&&u>3&&n.phys.p.y<3.5&&l<.35&&i.cfg.rng.chance(.08+t.fld/400)){const d=u||1;(!i.cfg.userDefense||i.controlled!==t)&&ph(i,t,{x:(n.phys.p.x-t.x)/d,z:(n.phys.p.z-t.z)/d})}Ms(t,n.phys.p.x,n.phys.p.z)}else if(t.task==="cover"&&t.coverBase>=1){const o=Ge(t.coverBase);if(s=o.x,r=o.z,n.mode==="thrown"&&n.throwBase===t.coverBase){const l=n.throwTarget.x-o.x,c=n.throwTarget.z-o.z;Math.hypot(l,c)<9&&(s=n.throwTarget.x,r=n.throwTarget.z)}Ms(t,n.phys.p.x,n.phys.p.z)}else if(t.task==="backup"){const o=i.intercept,l=t.pos==="LF"||t.pos==="CF"||t.pos==="RF";o&&l&&n.mode==="loose"?(s=t.home.x+(o.x-t.home.x)*.45,r=t.home.z+(o.z-t.home.z)*.45,a*=.8):t.pos==="P"?(s=0,r=50,a*=.6):(s=t.x,r=t.z),Ms(t,n.phys.p.x,n.phys.p.z)}else t.task==="tag"&&t.target&&(s=t.target.x,r=t.target.z);Wn(t,s,r,a,e)}function Md(i,t,e,n,s,r){const a=e-i,o=n-t,l=a*a+o*o,c=l>1e-9?Xt(((s-i)*a+(r-t)*o)/l,0,1):1;return{t:c,x:i+a*c,z:t+o*c}}function bd(i){const t=i.ball;if(t.mode!=="loose"&&t.mode!=="thrown")return;const e=t.prev,n=t.phys.p,s=Math.hypot(t.phys.v.x,t.phys.v.y,t.phys.v.z);let r=null,a=1/0,o=0;for(const f of i.fielders){if(f.catchCd>0||f.down>0||t.mode==="thrown"&&f===t.thrower||t.mode==="thrown"&&Math.hypot(f.x-t.throwTarget.x,f.z-t.throwTarget.z)>14)continue;const g=Md(e.x,e.z,n.x,n.z,f.x,f.z),v=e.y+(n.y-e.y)*g.t,m=Math.hypot(g.x-f.x,g.z-f.z),p=f.dive>0?6.5:f.jump>0?3.2:2.5,M=f.dive>0?3.8:f.jump>0?11:7.8;(g.t<1||m<=p*.45)&&m<=p&&v<=M&&v>=-.5&&m<a&&(a=m,r=f,o=v)}if(!r)return;const l=r,c=l.dive>0?6.5:l.jump>0?3.2:2.5,u=a/c,h=(l.fld-70)/500;let d;t.mode==="thrown"?(d=.997+h*.3-Math.max(0,u-.5)*.12,o<1.2&&(d=.55+l.fld*.004),o>7&&(d-=.25)):t.battedInAir?(d=.994+h-u*u*.12-Math.max(0,s-120)/260*u,l.dive>0&&(d-=.22),l.jump>0&&(d-=.3)):(d=.988+h-u*u*.07-Math.max(0,s-85)/500,l.dive>0&&(d-=.18)),d=Xt(d,.2,.997),l.catchCd=.35,i.cfg.rng.chance(d)?Rd(i,l):u>.75&&t.mode!=="thrown"?(l.catchCd=1,i.emit("miss",{pos:l.pos})):wd(i,l,d)}function Rd(i,t){const e=i.ball,n=e.battedInAir,s=e.mode==="thrown";if(!(e.fair==="pending"&&!n&&(i.decideFair(),i.foul))){if(e.mode="held",e.holder=t,e.touchedByFielder=!0,t.hasBall=!0,t.holdTime=0,t.catchAnim=.35,t.thinkCd=0,i.firstTouch||(i.firstTouch=t),s&&e.thrower){const r=i.assists.get(e.thrower.player.id)??[];i.assists.set(t.player.id,[...r,e.thrower.player.id])}if(i.chaser=null,i.emit(s?"catchThrow":"catch",{pos:t.pos,air:n}),n){e.battedInAir=!1,e.fair==="pending"&&(e.fair="fair"),i.caughtFly=!0;const r=i.batterRunner();if(r){const a=i.cfg.launchAngle??30;i.recordOut(r,a>50?"pop":a<22?"line":"fly",0,t)}t.dive>0&&i.notable.add("diving"),t.jump>0&&i.notable.add("robbed");for(const a of i.activeRunners())!a.isBatter&&a.p>a.startBase*90+.5&&(a.mustRetag=!0),a.thinkCd=0}else for(const r of i.activeRunners())r.thinkCd=0;i.cfg.userDefense&&(i.controlled=t);for(const r of i.fielders)r.task==="chase"&&r!==t&&(r.task="backup");Ps(i)}}function wd(i,t,e){const n=i.ball,s=i.cfg.rng;if(n.fair==="pending"&&!n.battedInAir&&(i.decideFair(),i.foul))return;i.firstTouch||(i.firstTouch=t),n.touchedByFielder=!0;const r=n.mode==="thrown",a=n.thrower;r&&(n.mode="loose",n.phys.rolling=!1,n.phys.stopped=!1);const o=Math.hypot(n.phys.v.x,n.phys.v.z),l=s.range(0,Math.PI*2),c=Math.min(25,o*.25+4);if(n.phys.v={x:Math.sin(l)*c+n.phys.v.x*.15,y:Math.abs(n.phys.v.y)*.2+2,z:Math.cos(l)*c+n.phys.v.z*.15},n.phys.rolling=!1,n.phys.stopped=!1,i.emit("bobble",{pos:t.pos}),e>=.9){const u=r&&a&&e<.9?a:t;i.errors.push(u.player.id),i.emit("error",{pos:u.pos});const h=i.batterRunner();h&&!h.out&&(h.lastTouched<1?i.errorBeforeBatterSafe=!0:i.batterReachedBeforeError<0&&(i.batterReachedBeforeError=h.lastTouched))}i.repath(),i.chaser=jo(i),Ps(i);for(const u of i.activeRunners())u.thinkCd=0}function Fr(i,t,e,n,s){const r=i.ball;if(!t.hasBall)return;const a=fh(i,e),o=Ge(e);let l=o.x,c=o.z;a&&Math.hypot(a.x-o.x,a.z-o.z)<6&&(l=a.x,c=a.z);const u=i.handPos(t);u.y=6;const h={x:l+s.x,y:4.4+s.y,z:c+s.z},d=dh(t)*n*(1-Math.min(.18,Math.hypot(h.x-u.x,h.z-u.z)/1800)),f=Math.hypot(h.x-u.x,h.z-u.z),g=Math.max(.12,f/d);r.phys.p=u,r.phys.v={x:(h.x-u.x)/g,y:(h.y-u.y+.5*Yi*g*g)/g,z:(h.z-u.z)/g},r.phys.backspin=0,r.phys.sidespin=0,r.phys.rolling=!1,r.phys.stopped=!1,r.prev={...u},r.mode="thrown",r.holder=null,r.thrower=t,r.throwBase=e,r.throwTarget={x:h.x,z:h.z},t.hasBall=!1,t.throwAnim=.4,t.facing=Math.atan2(h.x-t.x,h.z-t.z),t.task="backup",i.lastThrower=t,i.emit("throw",{base:e,pos:t.pos,mph:d/ss}),i.cfg.userDefense&&a&&(i.controlled=a);for(const v of i.activeRunners())v.thinkCd=0}function mh(i){const t=.09+i.fld/100*.07+i.player.ratings.arm/100*.04;return{start:.8-t/2,end:.8+t/2}}function Ed(i,t,e){const n=mh(t),s=i.cfg.rng;let r=1;const a={x:s.gauss(.35),y:s.gauss(.25),z:s.gauss(.35)};if(e<n.start)r=.55+.45*(e/n.start),a.y-=(n.start-e)*8,a.x+=s.gauss((n.start-e)*5),a.z+=s.gauss((n.start-e)*5);else if(e>n.end){r=1.06;const o=e-n.end;a.y+=o*26,a.x+=s.gauss(o*22),a.z+=s.gauss(o*22)}return i.emit("throwGrade",{grade:e<n.start?"WEAK":e>n.end?"OFFLINE":"ACCURATE"}),{effort:r,err:a}}function aa(i,t,e){const n=i.cfg.rng,s=(.2+(100-t.fld)/100*1.1)*Math.max(.5,e/110),r={x:n.gauss(s),y:n.gauss(s*.6),z:n.gauss(s)},a=(100-t.fld)/100*.03+(e>200?.01:0);return n.chance(a)&&(n.chance(.5)?r.y+=n.range(5,9):r.x+=n.pick([-1,1])*n.range(6,12)),r}function Td(i,t,e){if(t.thinkCd-=e,i.cfg.userDefense&&i.controlled===t)return;const n=t.pos==="LF"||t.pos==="CF"||t.pos==="RF",s=t.pos==="C"?.62:(n?.85:.6)+(100-t.fld)*.004;if(t.holdTime<s){t.vx*=.8,t.vz*=.8;return}if(i.totalOuts()>=3)return;if(t.thinkCd>0){t.target&&Wn(t,t.target.x,t.target.z,t.speed,e);return}t.thinkCd=.12,t.target=null;const r=[];for(const h of i.activeRunners()){if(h.trot)continue;const d=h.goal>h.p+.1,f=h.goal<h.p-.1;if(_n(h)&&!d&&!h.mustRetag)continue;let g,v=!1;if(h.mustRetag?(g=h.startBase,v=!0):f?g=Math.round(h.goal/90):(g=Math.ceil((h.p+.01)/90),v=i.isForced(h)&&g===h.startBase+1&&h.lastTouched<g),g<0||g>4)continue;const m=Math.abs(g*90-h.p),p=Math.max(h.v,h.top*.7),M=m/p+Math.max(0,h.delay),b=Ge(g),x=Math.hypot(t.x-b.x,t.z-b.z)/t.speed,E=fh(i,g);let T=1/0;if(E&&E!==t){const _=Math.hypot(E.x-b.x,E.z-b.z)/E.speed;T=Math.max(Za(t,b),_)+(v?.05:.3)}const C=x+(v?0:.15)<T,A=C?x+(v?0:.15):T;r.push({r:h,base:g,margin:M-A,self:C,forced:v})}const o=!i.cfg.batter&&t.pos==="C"?-.35:.04,l=r.filter(h=>h.margin>o);if(l.length){l.sort((d,f)=>f.margin+f.base*.18+(f.forced?.15:0)-(d.margin+d.base*.18+(d.forced?.15:0)));const h=l[0];if(h.self){const d=Ge(h.base);if(t.target={x:d.x,z:d.z},!h.forced&&!h.r.mustRetag){const f=hi(h.r.p);t.target={x:f.x,z:f.z}}Wn(t,t.target.x,t.target.z,t.speed,e)}else{const d=Ge(h.base);Fr(i,t,h.base,1,aa(i,t,Math.hypot(t.x-d.x,t.z-d.z)))}return}const c=i.activeRunners().find(h=>!_n(h)&&!h.trot&&Math.abs(h.goal-h.p)<.5);if(c){const h=hi(c.p);if(Math.hypot(h.x-t.x,h.z-t.z)<40){t.target={x:h.x,z:h.z},Wn(t,h.x,h.z,t.speed,e);return}const f=Math.ceil((c.p+.01)/90),g=c.goal>c.p?f:Math.floor(c.p/90),v=Ge(g);if(Math.hypot(t.x-v.x,t.z-v.z)>30){Fr(i,t,Math.max(1,g),.9,aa(i,t,Math.hypot(t.x-v.x,t.z-v.z)));return}}if(Math.hypot(t.x,t.z)>165){const h=i.activeRunners().filter(g=>!g.trot&&g.goal>g.p+.1);let d=2;h.length&&(d=Math.min(...h.map(g=>Math.min(4,Math.max(2,Math.round(g.goal/90))))));const f=Ge(d);Fr(i,t,d,.95,aa(i,t,Math.hypot(t.x-f.x,t.z-f.z)));return}Wn(t,t.x,t.z,0,e)}const Hs={ROOKIE:0,MINORS:1,VETERAN:2,"ALL-STAR":3,"HALL OF FAME":4,LEGEND:5};class Pl{constructor(t){I(this,"cfg");I(this,"t",0);I(this,"fielders",[]);I(this,"runners",[]);I(this,"ball");I(this,"outs",[]);I(this,"runsScored",[]);I(this,"errors",[]);I(this,"events",[]);I(this,"over",!1);I(this,"overTimer",-1);I(this,"settledTime",0);I(this,"controlled",null);I(this,"userMoved",!1);I(this,"homeRun",!1);I(this,"groundRuleDouble",!1);I(this,"foul",!1);I(this,"caughtFly",!1);I(this,"firstTouch",null);I(this,"batterReachedBeforeError",-1);I(this,"errorBeforeBatterSafe",!1);I(this,"notable",new Set);I(this,"chaser",null);I(this,"chaseCd",0);I(this,"intercept",null);I(this,"flyCatchable",!1);I(this,"assists",new Map);I(this,"lastThrower",null);I(this,"maxTime",40);this.cfg=t;const e=ch(t.stadium);for(const s of hh){const r=t.defense[s],a=e[s],o=s==="P"?{x:0,z:55}:a,l=Math.max(10,r.ratings.fielding-(t.fieldingPenalty[s]??0)),c=t.rng.gauss(1);this.fielders.push({pos:s,player:r,x:o.x,z:o.z,vx:0,vz:0,facing:Math.PI,home:a,task:"idle",coverBase:-1,target:null,react:Math.max(.15,.6-r.ratings.reaction*.0038+t.rng.gauss(.04)),speed:20.5+r.ratings.speed*.062,fld:l,routeErr:{x:c*(100-l)*.12,z:t.rng.gauss(1)*(100-l)*.12},dive:0,down:0,diveDir:{x:0,z:0},jump:0,hasBall:!1,holdTime:0,catchCd:0,throwAnim:0,catchAnim:0,thinkCd:0})}for(const s of t.runners){const r=Tl(s.player,s.base,s.responsiblePitcherId,s.reachedOnError,!1,s.p);s.stealing&&(r.stealingFlag=!0,r.goal=(s.base+1)*90),this.runners.push(r)}if(t.batter){const s=Tl(t.batter,0,t.pitcherId,!1,!0);s.delay=t.swingType==="power"?.42:t.swingType==="contact"?.3:.35,s.goal=90,this.runners.push(s)}const n=t.batted??t.wildBall??{p:{x:0,y:3,z:-2.6},v:{x:0,y:0,z:0},backspin:0,sidespin:0,rolling:!1,bounces:0,stopped:!1};if(this.ball={mode:"loose",phys:n,prev:{...n.p},holder:null,touchedGround:!1,battedInAir:!!t.batted,fair:t.batted?"pending":"fair",thrower:null,throwBase:-1,throwTarget:{x:0,z:0},path:[],pathT0:0,touchedByFielder:!1,trail:!!t.batted&&t.batted.v.y!==void 0},t.start==="catcher"){const s=this.fielder("C");s.hasBall=!0,s.react=.5,this.ball.mode="held",this.ball.holder=s,this.ball.fair="fair",this.controlled=s}else t.start==="wild"&&(this.ball.touchedGround=!0);this.ball.mode==="loose"&&this.repath(),_d(this),pd(this)}fielder(t){return this.fielders.find(e=>e.pos===t)}emit(t,e){this.events.push({type:t,data:e})}repath(){this.ball.path=ad(this.ball.phys,this.cfg.env,9,1/60),this.ball.pathT0=this.t,this.chaseCd=0}activeRunners(){return this.runners.filter(t=>!t.out&&!t.scored)}totalOuts(){return this.cfg.outsBefore+this.outs.length}batterRunner(){return this.runners.find(t=>t.isBatter)}isForced(t){if(this.caughtFly)return!1;const e=this.batterRunner();if(!e||e.out)return!1;if(t.isBatter)return!0;for(let n=1;n<=t.startBase;n++){const s=this.runners.find(r=>r.startBase===n-1&&(n-1>0||r.isBatter));if(!s||s.out)return!1}return!0}handPos(t){return{x:t.x+Math.sin(t.facing+.6)*.9,y:t.dive>0?1:4.6,z:t.z+Math.cos(t.facing+.6)*.9}}update(t,e){this.over||(this.t+=t,this.events=this.events.length>200?[]:this.events,this.updateBall(t),yd(this,t,e),!this.homeRun&&!this.foul&&bd(this),md(this,t),!this.homeRun&&!this.foul&&this.checkOuts(),this.checkEnd(t))}updateBall(t){const e=this.ball;if(e.prev={...e.phys.p},e.mode==="held"&&e.holder){const s=this.handPos(e.holder);e.phys.p=s,e.phys.v={x:0,y:0,z:0};return}if(e.mode==="dead"){if(this.homeRun){const s=e.phys.p,r=e.phys.v;s.y>-20&&(r.y-=Yi*t,s.x+=r.x*t,s.y+=r.y*t,s.z+=r.z*t)}else if(!e.phys.stopped)for(let s=0;s<4;s++)Gr(e.phys,t/4,this.cfg.env);return}if(e.mode==="thrown"){const s=e.phys.p,r=e.phys.v;r.y-=Yi*t,s.x+=r.x*t,s.y+=r.y*t,s.z+=r.z*t,s.y<=Hn?(s.y=Hn,r.y=Math.abs(r.y)*.35,r.x*=.6,r.z*=.6,e.mode="loose",e.touchedGround=!0,e.phys.rolling=!1,e.phys.stopped=!1,e.phys.backspin=0,e.phys.sidespin=0,this.emit("bounce"),this.repath()):Math.hypot(s.x-e.throwTarget.x,s.z-e.throwTarget.z)>20&&this.passedTarget()&&(e.mode="loose",e.phys.rolling=!1,e.phys.stopped=!1,this.repath());return}const n=4;for(let s=0;s<n;s++){const r=Gr(e.phys,t/n,this.cfg.env);if(r){if(r==="homerun"){const a=qn(e.phys.p.x,e.phys.p.z);e.battedInAir&&Math.abs(a)<=45.5?this.declareHomeRun():e.fair==="fair"||e.touchedGround&&Math.abs(a)<=45?this.declareGroundRuleDouble():this.declareFoul();return}if(r==="outofplay"){e.fair==="fair"?this.declareGroundRuleDouble():this.declareFoul();return}if(r==="bounce"){if(e.battedInAir){e.battedInAir=!1,e.touchedGround=!0;const a=Math.hypot(e.phys.p.x,e.phys.p.z);e.fair==="pending"&&(a>96||e.phys.p.z>75)&&this.decideFair(),this.emit("land",{x:e.phys.p.x,z:e.phys.p.z})}e.touchedGround=!0,this.repath()}r==="wall"&&(e.touchedGround=!0,e.battedInAir&&(e.battedInAir=!1,e.fair==="pending"&&this.decideFair()),this.emit("wall"),this.repath())}}e.fair==="pending"&&!e.battedInAir&&(Math.hypot(e.phys.p.x,e.phys.p.z)>96||e.phys.p.z>75||e.phys.stopped)&&this.decideFair(),e.fair==="pending"&&e.battedInAir&&e.phys.p.z<-4&&e.phys.p.y<2&&this.decideFair()}passedTarget(){const t=this.ball,e={x:t.throwTarget.x-t.phys.p.x,z:t.throwTarget.z-t.phys.p.z};return e.x*t.phys.v.x+e.z*t.phys.v.z<0}decideFair(){const t=this.ball;if(t.fair!=="pending")return;const e=qn(t.phys.p.x,t.phys.p.z),n=Math.abs(e)<=45.3&&t.phys.p.z>-.5;t.fair=n?"fair":"foul",n?this.emit("fair"):this.declareFoul()}declareFoul(){this.foul||(this.foul=!0,this.ball.fair="foul",this.ball.mode="dead",this.emit("foul"),this.overTimer=.9)}declareHomeRun(){this.homeRun=!0,this.ball.fair="fair",this.ball.mode="dead",this.notable.add("homerun"),this.emit("homerun");for(const t of this.activeRunners())t.goal=360,t.trot=!0,t.manual=!0,t.mustRetag=!1,t.delay=Math.min(t.delay,.2);for(const t of this.fielders)t.task="idle",t.target=null}declareGroundRuleDouble(){this.groundRuleDouble=!0,this.ball.mode="dead",this.emit("grd");const t=this.batterRunner();for(const e of this.activeRunners()){const n=e.isBatter?2:Math.min(4,e.startBase+2);e.goal=n*90,e.manual=!0,e.trot=!0,e.mustRetag=!1}t&&(t.goal=180),this.overTimer=2.2}checkOuts(){const t=this.ball;if(t.mode!=="held"||!t.holder)return;const e=t.holder;if(!(e.down>0)){for(const n of this.activeRunners())if(!n.out){if(this.isForced(n)){const s=n.startBase+1;if(n.lastTouched<s){const r=Ge(s);if(Math.hypot(e.x-r.x,e.z-r.z)<3.2){this.recordOut(n,"force",s,e);continue}}}if(n.mustRetag){const s=Ge(n.startBase);if(Math.hypot(e.x-s.x,e.z-s.z)<3.2){this.recordOut(n,"appeal",n.startBase,e);continue}}if(!_n(n)){const s=hi(n.p);Math.hypot(e.x-s.x,e.z-s.z)<3&&this.recordOut(n,"tag",Math.round(n.p/90),e)}}}}recordOut(t,e,n,s){if(t.out)return;t.out=!0,t.v=0;const r=s?this.assists.get(s.player.id)??[]:[],a={runnerId:t.id,how:e,base:n,putout:(s==null?void 0:s.player.id)??null,assists:[...r],time:this.t,force:e==="force"||t.isBatter&&t.lastTouched<1};if(this.outs.push(a),this.emit("out",{how:e,base:n,runner:t.player.name,pos:s==null?void 0:s.pos}),(e==="tag"||e==="force")&&Math.abs(t.p-n*90)<6&&this.notable.add("close"),this.outs.length>=2&&this.notable.add("doubleplay"),this.totalOuts()>=3){this.overTimer=.9;const o=a.force;this.runsScored=this.runsScored.filter(l=>!o&&l.time<a.time);for(const l of this.runners)!l.out&&!l.scored&&(l.v=0)}}scoreRunner(t){t.scored||t.out||this.totalOuts()>=3||(t.scored=!0,t.scoreTime=this.t,this.runsScored.push({runner:t,time:this.t}),this.emit("run",{runner:t.player.name}))}checkEnd(t){if(this.overTimer>=0){this.overTimer-=t,this.overTimer<=0&&(this.over=!0);return}if(this.homeRun){this.activeRunners().length===0&&(this.over=!0),this.t>25&&(this.over=!0);return}if(this.t>this.maxTime){Sd(this),this.over=!0;return}const e=this.ball;if(e.mode==="held"&&e.holder){const n=this.activeRunners(),s=n.every(a=>_n(a)&&Math.abs(a.p-a.goal)<.5&&a.delay<=0&&!a.mustRetag),r=Math.hypot(e.holder.x,e.holder.z-60)<110;s&&(r||n.length===0||e.holder.holdTime>1.5)?(this.settledTime+=t,this.settledTime>.45&&(this.over=!0)):this.settledTime=0}else this.settledTime=0}outcome(){var c;const t=this.batterRunner(),e=this.runsScored.map(u=>({runnerId:u.runner.id,unearned:u.runner.reachedOnError||this.errors.length>0,responsiblePitcherId:u.runner.responsiblePitcherId})),n=[null,null,null];for(const u of this.activeRunners()){const h=Math.round(u.p/90);if(h>=1&&h<=3)if(!n[h-1])n[h-1]=u.id;else{const d=h-2;d>=0&&!n[d]&&(n[d]=u.id)}}const s=this.cfg.launchAngle??0,r=this.cfg.batter?s<10?"GB":s<25?"LD":s<50?"FB":"PU":null;let a="none";if(this.cfg.batter&&!this.foul){if(this.homeRun)a="HR";else if(t!=null&&t.out)a="out";else if(this.groundRuleDouble)a="GRD";else if(t){const u=t.scored?4:Math.round(t.p/90);if(this.errorBeforeBatterSafe)a="ROE";else{const h=this.batterReachedBeforeError>0?Math.min(this.batterReachedBeforeError,u):u;this.outs.some(f=>f.runnerId!==t.id)&&h<=1?a="FC":a=["1B","1B","2B","3B","HR"][Math.max(1,Math.min(4,h))]}}}const o=this.caughtFly&&this.cfg.outsBefore<2&&e.length>0&&!!(t!=null&&t.out),l=this.describe(a);return{kind:this.foul?"foul":this.cfg.batter?"inplay":"nonbatted",homeRun:this.homeRun,groundRuleDouble:this.groundRuleDouble,outs:this.outs,runs:e,batterResult:a,bases:n,errors:this.errors,hitType:r,sacFly:o,doublePlay:this.outs.length===2,triplePlay:this.outs.length>=3,caughtStealing:this.runners.filter(u=>u.stealingFlag&&u.out).map(u=>u.id),stolenBases:this.runners.filter(u=>u.stealingFlag&&!u.out&&(u.scored||Math.round(u.p/90)>u.startBase)).map(u=>u.id),notable:[...this.notable],description:l,fielderFirstTouch:((c=this.firstTouch)==null?void 0:c.pos)??null}}describe(t){var a;const e=this.batterRunner(),n=(e==null?void 0:e.player.name)??"",s=(a=this.firstTouch)==null?void 0:a.pos,r=s?` to ${{P:"pitcher",C:"catcher","1B":"first","2B":"second","3B":"third",SS:"short",LF:"left",CF:"center",RF:"right"}[s]}`:"";if(this.foul)return"Foul ball";if(!this.cfg.batter)return"";switch(t){case"HR":return`${n} homers!`;case"GRD":return`${n} ground-rule double`;case"1B":return`${n} singles${r}`;case"2B":return`${n} doubles${r}`;case"3B":return`${n} triples${r}`;case"ROE":return`${n} reaches on an error${r}`;case"FC":return`${n} reaches on a fielder's choice`;case"out":{if(this.outs.length>=3)return"TRIPLE PLAY!";if(this.outs.length===2)return`${n} grounds into a double play`;const o=this.outs.find(l=>l.runnerId===(e==null?void 0:e.id));return(o==null?void 0:o.how)==="fly"?`${n} flies out${r}`:(o==null?void 0:o.how)==="line"?`${n} lines out${r}`:(o==null?void 0:o.how)==="pop"?`${n} pops out${r}`:`${n} grounds out${r}`}default:return""}}}function Fl(i,t){const e=i[t],n=Ze[e.teamId],s=e.lineup.map(a=>({player:Qe(a.playerId),pos:a.pos})),r=Qe(e.startingPitcherId);return{side:t,team:n,lineup:s,battingIdx:0,pitcher:r,pitchersUsed:[r],removed:new Set,linescore:[],runs:0,hits:0,errors:0,pitchCounts:new Map([[r.id,0]]),warmup:new Map(rh(n).map(a=>[a.id,0])),warming:null,runsThisInningAllowed:0,lob:0}}function Cd(i){return{settings:i,inning:1,half:"top",outs:0,balls:0,strikes:0,bases:[null,null,null],away:Fl(i,"away"),home:Fl(i,"home"),over:!1,winner:null,log:[],pitchOfRecord:{home:null,away:null},loserOfRecord:{home:null,away:null},lastLeader:null}}const Fe=i=>i.half==="top"?i.away:i.home,Te=i=>i.half==="top"?i.home:i.away,ze=i=>{const t=Fe(i);return t.lineup[t.battingIdx%9].player},Ve=i=>Te(i).pitcher;function Ir(i){var n;const t={P:i.pitcher};for(const s of i.lineup)s.pos!=="DH"&&s.pos!=="P"&&(t[s.pos]=s.player);const e=((n=i.lineup.find(s=>s.pos==="DH"))==null?void 0:n.player)??i.lineup[0].player;for(const s of["C","1B","2B","3B","SS","LF","CF","RF"])t[s]||(t[s]=e);return t}function Ad(i){const t=Ir(i),e={};for(const[n,s]of Object.entries(t))e[n]=n==="P"?0:Qu(s,n);return e}function gh(i){const t=i.pitcher;return t.role==="SP"?55+t.stamina*.65:14+t.stamina*.65}function Fs(i,t=i.pitcher){const e=i.pitchCounts.get(t.id)??0,n=i.warmup.get(t.id),s=n!==void 0&&t!==i.pitchersUsed[0]?(1-Math.min(1,n))*.35:0;return e/gh(t)+s}class Ld{constructor(t,e){I(this,"s");I(this,"stats");I(this,"notices",[]);this.s=t,this.stats=e;for(const n of["away","home"]){for(const s of t[n].lineup)e.addBatter(n,s.player.id);e.addPitcher(n,t[n].pitcher.id)}}notice(t,e,n){this.notices.push({type:t,text:e,data:n}),this.s.log.push(e)}countPitch(t){const e=Te(this.s),n=e.pitcher;e.pitchCounts.set(n.id,(e.pitchCounts.get(n.id)??0)+1);const s=this.stats.p(n.id);s.pitches++,t&&s.strikes++,e.warming&&e.warmup.set(e.warming,Math.min(1,(e.warmup.get(e.warming)??0)+.11))}applyPitch(t){const e=this.s;return t==="hbp"?(this.endPAWalk(!0),"hbp"):t==="ball"?(e.balls++,e.balls>=4?(this.endPAWalk(!1),"walk"):null):t==="foul"?(e.strikes<2&&e.strikes++,null):(e.strikes++,e.strikes>=3?(this.strikeout(t==="called_strike"),"strikeout"):null)}strikeout(t){const e=this.s,n=ze(e),s=Ve(e),r=this.stats.b(n.id);r.PA++,r.AB++,r.SO++;const a=this.stats.p(s.id);a.SO++,a.BF++,a.outs++,e.outs++,this.notice("strikeout",`${n.name} strikes out ${t?"looking":"swinging"}`,{looking:t,risp:!!(e.bases[1]||e.bases[2])}),this.nextBatter()}endPAWalk(t){const e=this.s,n=ze(e),s=Ve(e),r=this.stats.b(n.id);r.PA++,t?r.HBP++:r.BB++;const a=this.stats.p(s.id);a.BF++,t?a.HBP++:a.BB++;let l={player:n,responsiblePitcherId:s.id,reachedOnError:!1};const c=[];for(let u=0;u<3&&l;u++){const h=e.bases[u];e.bases[u]=l,l=h}l&&c.push(l),this.notice(t?"hbp":"walk",`${n.name} ${t?"is hit by a pitch":"walks"}`);for(const u of c)this.scoreRun(u,n,!0);this.nextBatter()}scoreRun(t,e,n,s=!1){const r=this.s,a=Fe(r),o=Te(r);a.runs++;const l=r.inning-1;for(;a.linescore.length<=l;)a.linescore.push(0);a.linescore[l]++,this.stats.b(t.player.id).R++,e&&n&&this.stats.b(e.id).RBI++;const c=this.stats.p(t.responsiblePitcherId);c.R++,!s&&!t.reachedOnError&&c.ER++,o.runsThisInningAllowed++,this.trackLead(t.responsiblePitcherId)}trackLead(t){const e=this.s,n=e.home.runs>e.away.runs?"home":e.away.runs>e.home.runs?"away":null;if(n&&n!==e.lastLeader){const s=n==="home"?"away":"home";e.pitchOfRecord[n]=e[n].pitcher.id,e.loserOfRecord[s]=t}e.lastLeader=n}applyPlay(t,e){const n=this.s,s=Fe(n),r=Te(n),a=Ve(n),o=e?Qe(e):null,l=n.bases.slice(),c=new Map;for(const h of l)h&&c.set(h.player.id,h);o&&c.set(o.id,{player:o,responsiblePitcherId:a.id,reachedOnError:t.batterResult==="ROE"}),n.outs+=t.outs.length,this.stats.p(a.id).outs+=t.outs.length,r.errors+=t.errors.length;const u=t.errors.length===0&&!t.doublePlay&&t.batterResult!=="ROE";for(const h of t.runs){const d=c.get(h.runnerId);d&&this.scoreRun(d,o,!!o&&(u||t.homeRun||t.sacFly),h.unearned&&!t.homeRun)}n.bases=t.bases.map(h=>h?c.get(h)??null:null);for(const h of t.stolenBases)this.stats.b(h).SB++;for(const h of t.caughtStealing)this.stats.b(h).CS++;if(o){const h=this.stats.b(o.id),d=this.stats.p(a.id);h.PA++,d.BF++,t.sacFly?h.SF++:h.AB++,["1B","2B","3B","HR","GRD"].includes(t.batterResult)&&(h.H++,d.H++,s.hits++,(t.batterResult==="2B"||t.batterResult==="GRD")&&h.D++,t.batterResult==="3B"&&h.T++,t.batterResult==="HR"&&(h.HR++,d.HR++));let g=t.description;t.sacFly&&(g=`${o.name} hits a sacrifice fly`),t.triplePlay&&(g="TRIPLE PLAY!"),this.notice("play",g,{result:t.batterResult,runs:t.runs.length,outs:t.outs.length}),this.nextBatter()}else{for(const h of t.stolenBases)this.notice("steal",`${Qe(h).name} steals a base!`);for(const h of t.caughtStealing)this.notice("cs",`${Qe(h).name} is caught stealing`);t.runs.length&&!t.stolenBases.length&&this.notice("play","Run scores on the wild pitch!")}}nextBatter(){const t=Fe(this.s);t.battingIdx=(t.battingIdx+1)%9,this.s.balls=0,this.s.strikes=0}isWalkoff(){const t=this.s;return t.half==="bottom"&&t.inning>=t.settings.innings&&t.home.runs>t.away.runs}checkProgress(){const t=this.s;return this.isWalkoff()?(this.finish("home"),"final"):t.outs<3?"continue":this.endHalf()}endHalf(){const t=this.s,e=Fe(t),n=t.inning-1;for(;e.linescore.length<=n;)e.linescore.push(0);e.lob+=t.bases.filter(Boolean).length;const s=t.inning>=t.settings.innings;if(t.half==="top"){if(s&&t.home.runs>t.away.runs)return this.finish("home"),"final";t.half="bottom"}else{if(s&&t.home.runs!==t.away.runs)return this.finish(t.home.runs>t.away.runs?"home":"away"),"final";t.half="top",t.inning++}if(t.outs=0,t.balls=0,t.strikes=0,t.bases=[null,null,null],Te(t).runsThisInningAllowed=0,t.inning>t.settings.innings&&t.settings.ghostRunner){const r=Fe(t),a=r.lineup[(r.battingIdx+8)%9].player;t.bases[1]={player:a,responsiblePitcherId:Te(t).pitcher.id,reachedOnError:!0}}return"half"}finish(t){const e=this.s;e.over=!0,e.winner=t;const n=t==="home"?"away":"home",s=e.pitchOfRecord[t],r=e.loserOfRecord[n];s&&(this.stats.p(s).dec="W"),r&&(this.stats.p(r).dec="L");const a=e[t].pitcher,o=Math.abs(e.home.runs-e.away.runs);a.id!==s&&o<=3&&e[t].pitchersUsed.length>1&&(this.stats.p(a.id).dec="S"),this.notice("final","FINAL")}changePitcher(t,e){t.pitcher.id!==e.id&&(t.removed.add(t.pitcher.id),t.pitcher=e,t.pitchersUsed.push(e),t.pitchCounts.has(e.id)||t.pitchCounts.set(e.id,0),t.warming===e.id&&(t.warming=null),this.stats.addPitcher(t.side,e.id))}}const Pd=()=>({PA:0,AB:0,R:0,H:0,D:0,T:0,HR:0,RBI:0,BB:0,SO:0,HBP:0,SF:0,SB:0,CS:0,LOB:0}),Fd=()=>({outs:0,H:0,R:0,ER:0,BB:0,SO:0,HR:0,HBP:0,pitches:0,strikes:0,BF:0,dec:""});class Id{constructor(){I(this,"bat",new Map);I(this,"pitch",new Map);I(this,"batOrder",{home:[],away:[]});I(this,"pitchOrder",{home:[],away:[]})}b(t){let e=this.bat.get(t);return e||(e=Pd(),this.bat.set(t,e)),e}p(t){let e=this.pitch.get(t);return e||(e=Fd(),this.pitch.set(t,e)),e}addBatter(t,e){this.batOrder[t].includes(e)||this.batOrder[t].push(e),this.b(e)}addPitcher(t,e){this.pitchOrder[t].includes(e)||this.pitchOrder[t].push(e),this.p(e)}}function vh(i){return`${Math.floor(i/3)}.${i%3}`}function Dd(i,t){if(t===0)return".000";const e=i/t;return e>=1?"1.000":e.toFixed(3).replace(/^0/,"")}function Sh(i){let t=2166136261;for(let e=0;e<i.length;e++)t=Math.imul(t^i.charCodeAt(e),16777619);return(t>>>0)%1e3/1e3}function ja(i){const t=i.ratings,e=(t.contactR*2+t.contactL)/3,n=(t.powerR*2+t.powerL)/3,s=Sh(i.id)-.5,r=Math.max(.18,Math.min(.335,.168+e*.0014+s*.02)),a=Math.max(0,Math.round((n-38)*.72+s*6)),o=Math.round(a*2.1+e*.45+s*10);return{avg:r.toFixed(3).replace(/^0/,""),hr:a,rbi:o}}function xh(i){const t=i.pitcher,e=Sh(i.id)-.5,n=(t.control+t.break+(t.velocity-86)*3)/3,s=Math.max(1.9,Math.min(5.8,7.4-n*.06+e*.6)),r=Math.max(.85,Math.min(1.6,1.85-n*.0095+e*.08)),a=t.role==="SP",o=a?120+t.stamina*.7:55+t.stamina*.3,l=Math.round(o*(.6+t.break/120+(t.velocity-90)*.03)),c=Math.round(a?o/16+(5-s)*1.6+e*2:2+e*4+2),u=a?Math.max(2,Math.round(o/20+(s-3)*1.5-e*2)):Math.max(0,Math.round(3-e*3));return{era:s.toFixed(2),whip:r.toFixed(2),so:l,w:Math.max(0,c),l:u}}const Bd=i=>i.filter(t=>!ye[t].fastball).sort((t,e)=>Math.abs(ye[e].ivb-8)+Math.abs(ye[e].hb)-(Math.abs(ye[t].ivb-8)+Math.abs(ye[t].hb)))[0];function Ud(i,t,e,n,s,r){const a=t.pitcher,o=Hs[n],l=o/5,{balls:c,strikes:u}=i,h=a.pitches,d=r.codes.slice(-3),f=u>c,g=c>u&&c>=2,v=Wr(e,t),m=(e.ratings.powerR+e.ratings.contactR)/2>78,p=!i.bases[0],b=h.map((z,$)=>{const X=ye[z];let q=$===0?1.6:1.1-$*.08;X.fastball?(g&&(q*=1.9),c===0&&u===0&&(q*=1.4)):(f&&(q*=1+.8*l+.3),u===2&&(q*=1.3+.6*l),(z==="CH"||z==="FS")&&v!==t.throws&&(q*=1.3),(z==="SL"||z==="ST")&&v===t.throws&&(q*=1.3));const Z=d.filter(rt=>ye[rt].fastball).length;return!X.fastball&&Z>=2&&(q*=1+l),d.filter(rt=>rt===z).length>=2&&(q*=.45+(1-l)*.4),Math.max(.02,q)}).map(z=>z*l+(1-l)*1);let x=s.weighted(h,b);u===2&&s.chance(.25*l)&&(x=Bd(h)??x);const E=v==="R"?1:-1,T=ye[x];let C,A;const _=s.next();if(u===2&&!T.fastball&&_<.55+l*.2)C=E*s.range(.3,.9),A=s.range(.95,1.35);else if(u===2&&T.fastball&&_<.4)C=s.range(-.5,.5),A=s.range(3.4,3.85);else if(g||c===3)C=E*s.range(-.25,.45),A=s.range(2.1,2.9);else if(m&&p&&s.chance(.4*l))C=E*s.range(.7,.98),A=s.pick([1.6,3.35])+s.gauss(.1);else if(s.chance(.12))C=s.range(-.35,.35),A=s.range(2.2,2.9);else{const z=.8+l*.26;C=(s.chance(.65)?E:-E)*s.range(z-.3,z+.22),A=T.ivb<3?s.range(1.1,2.1):s.range(1.5,3.6)}const y=[.48,.38,.29,.22,.17,.13][o]*(1.25-a.control/100*.45);let L=s.gauss(y);const U=[.14,.1,.07,.045,.03,.02][o];return s.chance(U)&&(C=s.range(-.3,.3),A=s.range(2.4,3),L=-.25),{code:x,target:{x:C,y:A},meterError:L}}function Nd(i,t,e,n,s,r,a){const o=Hs[s],l=[1.5,1.28,1.1,1,.9,.82][o],c=t.ratings,u=(c.vision*.6+c.discipline*.4)/100,h=ye[n.code],d=Math.hypot(h.hb,h.ivb-8)/12,f=(.6-u*.4)*l*(1+d*.34+Math.max(0,n.mph-90)/35),g={x:n.plate.x+r.gauss(f),y:n.plate.y+r.gauss(f*.9)},{balls:v,strikes:m}=i;let p;if(oh(g.x,g.y))p=.78+(m===2?.24:0)-(v===3&&m===0?.55:0)-(v===0&&m===0?.12:0)+(v===3&&m===2?.1:0);else{const X=Math.max(Math.abs(g.x)-Wi.halfWidth,Wi.bottom-g.y,g.y-Wi.top,0);p=(1-c.discipline/100)*.62*Math.exp(-X*2.3)*(m===2?1.5:1)*l,v===3&&m<2&&(p*=.5)}if(p=Xt(p,0,.97),!r.chance(p))return{swing:null,perceived:g,decision:"take"};const M=e.throws==="R"?c.powerR:c.powerL,b=e.throws==="R"?c.contactR:c.contactL;let x="normal";m===2&&b<75?x="contact":v===2&&m===0||v===3&&m===1||v===1&&m===0?M>72&&r.chance(.5)&&(x="power"):M>85&&r.chance(.2)&&(x="power");const E=Ls(n,Ji),T=e.pitcher.velocity,C=E*(n.mph/T),A=a.codes.length&&ye[a.codes[a.codes.length-1]].fastball,_=Xt(u*1.05-d*.12-(A&&!h.fastball?.1:0),.05,.95)/l,y=(C-E)*(1-Xt(_,0,.95))*.7,L=Xt(.036-b*19e-5,.012,.04)*l,U=E+y+r.gauss(L)+.006-Vr,z=As(n,E),$={x:z.x+(g.x-n.plate.x)*.6+r.gauss(f*.22),y:z.y+(g.y-n.plate.y)*.6+r.gauss(f*.22)-(M>70?.06:.02)};return{swing:{type:x,pci:$,pressTime:U},perceived:g,decision:"swing"}}function Od(i,t,e){if(i.outs===2&&i.strikes===2&&i.balls===3)return-1;const n=Hs[t],s=i.bases[0],r=i.bases[1],a=i.bases[2];if(s&&!r){const o=s.player.ratings.stealing,l=Math.max(0,(o-62)/100)*(.22+n*.02);if(e.chance(l))return 0}if(r&&!a&&i.outs<2){const o=r.player.ratings.stealing,l=Math.max(0,(o-76)/100)*.18;if(e.chance(l))return 1}return-1}function Il(i,t){const e=Fs(t),n=t.team.roster.filter(h=>h.pitcher&&h.pitcher.role!=="SP"&&!t.pitchersUsed.includes(h)&&!t.removed.has(h.id));if(!n.length)return null;const s=i.inning>=Math.max(2,i.settings.innings-1),r=t.side==="home"?i.home.runs-i.away.runs:i.away.runs-i.home.runs,a=n.find(h=>h.pitcher.role==="CL"),o=()=>n.filter(h=>h.pitcher.role!=="CL"||s).sort((h,d)=>d.pitcher.control+d.pitcher.break+d.pitcher.velocity-(h.pitcher.control+h.pitcher.break+h.pitcher.velocity))[0]??n[0],l=s&&r>0&&r<=3&&a&&i.inning>=i.settings.innings?a:o();e>.68&&!t.warming&&(t.warming=l.id);const c=t.runsThisInningAllowed>=4||t.runsThisInningAllowed>=3&&e>.6,u=s&&i.inning>=i.settings.innings&&r>0&&r<=3&&a&&t.pitcher!==a&&t.pitcher.pitcher.role!=="CL"&&i.outs===0&&i.balls===0&&i.strikes===0;return e>1||c||u?u?a:t.warming?n.find(h=>h.id===t.warming)??l:l:null}function zd(){return{kind:"inplay",homeRun:!1,groundRuleDouble:!1,outs:[],runs:[],batterResult:"out",bases:[null,null,null],errors:[],hitType:null,sacFly:!1,doublePlay:!1,triplePlay:!1,caughtStealing:[],stolenBases:[],notable:[],description:"",fielderFirstTouch:null}}const Dl=i=>({runnerId:i,how:"ground",base:1,putout:null,assists:[],time:0,force:!0});function kd(i,t,e){const n=ze(i),s=Ve(i),r=s.pitcher,a=s.throws==="R",o=a?n.ratings.contactR:n.ratings.contactL,l=a?n.ratings.powerR:n.ratings.powerL,c=n.ratings.discipline,u=(r.break+(r.velocity-85)*3+r.control)/3,h=Math.round(3+e.range(0,2.6));for(let E=0;E<h;E++)t.countPitch(e.chance(.63));const d=.21+(u-70)/220-(o-65)/260,f=.08+(c-60)/650-(r.control-65)/500,g=e.next();if(g<f){i.balls=3,t.applyPitch("ball");return}if(g<f+.01){t.applyPitch("hbp");return}if(g<f+.01+d){i.strikes=2,t.applyPitch("swinging_strike");return}const v=zd(),m=i.bases.map(E=>(E==null?void 0:E.player.id)??null),p=.3+(o-65)/420-(u-70)/650,M=.045+(l-60)/650,b=e.next(),x=E=>E.filter(Boolean).forEach(T=>{var C;return v.runs.push({runnerId:T,unearned:!1,responsiblePitcherId:((C=i.bases.find(A=>(A==null?void 0:A.player.id)===T))==null?void 0:C.responsiblePitcherId)??s.id})});if(b<M)v.batterResult="HR",v.homeRun=!0,x(m),v.runs.push({runnerId:n.id,unearned:!1,responsiblePitcherId:s.id}),v.description=`${n.name} homers!`;else if(b<p){const E=e.next(),T=E<.7?1:E<.95?2:3;v.batterResult=["1B","2B","3B"][T-1];const C=[null,null,null];for(let A=2;A>=0;A--){const _=m[A];if(!_)continue;const y=T===1&&A>=1&&e.chance(.6)||T===2&&A===0&&e.chance(.4)?1:0,L=A+T+y;L>=3?x([_]):C[L]=_}C[T-1]=n.id,v.bases=C,v.description=`${n.name} ${["singles","doubles","triples"][T-1]}`}else{v.batterResult="out",v.outs.push(Dl(n.id)),v.bases=[...m];const E=e.chance(.45);!E&&m[0]&&i.outs<2&&e.chance(.3)?(v.outs.push(Dl(m[0])),v.bases[0]=null,v.doublePlay=!0,v.description=`${n.name} grounds into a double play`):E&&m[2]&&i.outs<2&&e.chance(.55)?(x([m[2]]),v.bases[2]=null,v.sacFly=!0):v.description=`${n.name} ${E?"flies out":"grounds out"}`,!E&&!v.doublePlay&&i.outs<2&&(v.bases[2]&&e.chance(.4)&&(x([v.bases[2]]),v.bases[2]=null),v.bases[1]&&!v.bases[2]&&(v.bases[2]=v.bases[1],v.bases[1]=null))}t.applyPlay(v,n.id)}const _h=()=>({pci:{x:0,y:Ki},aim:{x:0,y:Ki},swing:null,pitchSelect:null,meterPress:!1,defense:{move:{x:0,z:0},sprint:!1,dive:!1,throwTo:null,throwMeter:0},runnerCmd:null,skip:!1}),Hd=[1.55,1.32,1.15,1,.9,.82],Gd=[1.42,1.26,1.12,1,.92,.85],Vd=[.78,.84,.9,.95,1,1],oa=1.15;class Wd{constructor(t,e,n){I(this,"settings");I(this,"prefs");I(this,"rng");I(this,"state");I(this,"stats",new Id);I(this,"rules");I(this,"env");I(this,"phase","atbat_intro");I(this,"phaseT",0);I(this,"clock",0);I(this,"events",[]);I(this,"flight",null);I(this,"pitchCmd",null);I(this,"pitchT",0);I(this,"pitchDone",!1);I(this,"swing",null);I(this,"swingResolved",!1);I(this,"contact",null);I(this,"aiPlan",null);I(this,"lastCall","");I(this,"history",{home:{codes:[]},away:{codes:[]}});I(this,"userPitch",{stage:"select",code:"FF",target:{x:0,y:Ki},meter:0,locked:null,zoneCenter:.85,zoneHalf:.05});I(this,"pci",{x:0,y:Ki});I(this,"stealers",new Map);I(this,"stealCommitted",!1);I(this,"cpuThink",0);I(this,"paEnded",!1);I(this,"play",null);I(this,"lastOutcome",null);I(this,"lastPlayNotable",[]);I(this,"postplayDur",1.6);I(this,"runnerSel",null);I(this,"hrInfo",null);I(this,"landingOffset",{x:0,z:0});I(this,"tiredWarned",new Set);this.settings=t,this.prefs=e,this.rng=new ed(n),this.state=Cd(t),this.rules=new Ld(this.state,this.stats),this.env=rd(Vi[t.stadiumId],t.conditions),this.startAtBat()}get stadium(){return Vi[this.settings.stadiumId]}get diffIndex(){return Hs[this.settings.difficulty]}userSideBatting(){return this.settings.userSide!=="none"&&Fe(this.state).side===this.settings.userSide}userSidePitching(){return this.settings.userSide!=="none"&&Te(this.state).side===this.settings.userSide}emit(t,e,n,s){this.events.push({type:t,text:e,sub:n,data:s})}drainEvents(){const t=this.events;return this.events=[],t}setPhase(t){this.phase=t,this.phaseT=0}timeScale(){return(this.phase==="windup"||this.phase==="pitch")&&this.userSideBatting()?this.prefs.pitchSpeed==="real"?1:this.prefs.pitchSpeed==="slow"?.72:Vd[this.diffIndex]:1}startAtBat(){const t=this.state;this.setPhase("atbat_intro"),this.flight=null,this.contact=null,this.swing=null,this.play=null,this.stealers.clear();const e=Te(t);if(this.settings.userSide==="none"||e.side!==this.settings.userSide){const r=Il(t,e);r&&this.changePitcher(e,r)}else Fs(e)>.85&&!this.tiredWarned.has(e.pitcher.id)&&(this.tiredWarned.add(e.pitcher.id),this.emit("toast",`${e.pitcher.name} is tiring`,`${e.pitchCounts.get(e.pitcher.id)} pitches — ESC › Bullpen to make a change`));const s=ze(t);this.stats.addBatter(Fe(t).side,s.id),this.emit("batterUp",s.name,void 0,{id:s.id})}changePitcher(t,e){const n=t.pitcher;this.rules.changePitcher(t,e),this.emit("pitchingChange",e.name,`replaces ${n.name}`,{id:e.id})}startPrepitch(){this.setPhase("prepitch"),this.contact=null,this.swing=null,this.swingResolved=!1,this.flight=null,this.pitchDone=!1,this.stealCommitted=!1,this.stealers.clear(),this.cpuThink=.55+this.rng.range(0,.6);const e=Ve(this.state).pitcher,n=e.pitches.includes(this.userPitch.code)?this.userPitch.code:e.pitches[0];if(this.userPitch={stage:"select",code:n,target:{...this.userPitch.target},meter:0,locked:null,zoneCenter:.86,zoneHalf:.022+e.control*55e-5},!this.userSideBatting()||this.settings.userSide==="none"){const s=Od(this.state,this.settings.difficulty,this.rng);s>=0&&this.stealers.set(s,(s+1)*90)}}beginWindup(t){this.pitchCmd=t,this.setPhase("windup"),this.emit("windup")}releasePitch(){const t=this.state,e=Ve(t),n=ze(t),s=Te(t),r=Wr(n,e);this.flight=cd(e,r,this.pitchCmd,Fs(s),this.rng),this.pitchT=0,this.setPhase("pitch"),this.history[s.side].codes.push(this.flight.code),this.emit("pitchRelease",void 0,void 0,{mph:this.flight.mph,code:this.flight.code}),this.userSideBatting()?this.aiPlan=null:this.aiPlan=Nd(t,n,e,this.flight,this.settings.difficulty,this.rng,this.history[s.side])}swingMods(){return this.userSideBatting()?{timing:Hd[this.diffIndex],pci:Gd[this.diffIndex]}:{timing:1,pci:1}}update(t,e){if(this.state.over&&this.phase==="final")return;const n=Math.min(.05,t)*this.timeScale();switch(this.clock+=n,this.phaseT+=n,this.pci={x:Xt(e.pci.x,-2.2,2.2),y:Xt(e.pci.y,.6,4.6)},e.runnerCmd&&this.userSideBatting()&&e.runnerCmd.sel!==void 0&&(this.runnerSel=e.runnerCmd.sel),this.phase){case"atbat_intro":(this.phaseT>1.5||e.skip&&this.phaseT>.25)&&this.startPrepitch();break;case"prepitch":this.updatePrepitch(n,e);break;case"windup":this.updateStealers(n,this.phaseT>oa-.45),this.userSideBatting()&&e.runnerCmd&&e.runnerCmd.dir>0&&this.userSteal(e.runnerCmd.sel),this.phaseT>=oa&&this.releasePitch();break;case"pitch":this.updatePitch(n,e);break;case"postpitch":(this.phaseT>.75||e.skip&&this.phaseT>.2)&&this.afterPostpitch();break;case"live":this.updateLive(n,e);break;case"postplay":(this.phaseT>this.postplayDur||e.skip&&this.phaseT>.35)&&this.afterPlay();break;case"half_end":(this.phaseT>2.6||e.skip&&this.phaseT>.4)&&this.startAtBat();break}}updatePrepitch(t,e){if(this.userSideBatting()&&e.runnerCmd&&e.runnerCmd.dir>0&&this.userSteal(e.runnerCmd.sel),this.userSidePitching()){const n=this.userPitch,s=Ve(this.state).pitcher;if(e.pitchSelect&&s.pitches.includes(e.pitchSelect)&&(n.code=e.pitchSelect,n.stage==="select"&&(n.stage="aim"),this.emit("pitchSelected",ye[n.code].name)),n.stage==="aim"||n.stage==="select")n.target={x:Xt(e.aim.x,-2,2),y:Xt(e.aim.y,.5,4.6)},e.meterPress&&(n.stage==="select"&&(n.stage="aim"),n.stage="meter",n.meter=0,this.emit("meterStart"));else if(n.stage==="meter"&&(n.meter+=t/1.05,e.meterPress||n.meter>=1.15)){n.locked=Math.min(n.meter,1.15),n.stage="locked";const r=n.locked-n.zoneCenter,a=Math.abs(r)<=n.zoneHalf?0:Math.sign(r)*Math.min(1.2,(Math.abs(r)-n.zoneHalf)/.28),o=a===0?"PERFECT":Math.abs(a)<.25?"GOOD":Math.abs(a)<.6?a<0?"EARLY":"LATE":a<0?"VERY EARLY":"VERY LATE";this.emit("meterResult",o),this.beginWindup({code:n.code,target:n.target,meterError:a})}return}if(this.cpuThink-=t,this.cpuThink<=0){const n=this.state,s=Ud(n,Ve(n),ze(n),this.settings.difficulty,this.rng,this.history[Te(n).side]);this.beginWindup(s)}}userSteal(t){const e=this.state,n=t!==null&&t>=1&&t<=3?[t-1]:[0,1,2];for(const s of n)e.bases[s]&&(s<2&&e.bases[s+1]&&!this.stealers.has(s+1)&&!n.includes(s+1)||this.stealers.has(s)||(this.stealers.set(s,(s+1)*90),this.emit("toast",`${e.bases[s].player.name} is running!`)))}updateStealers(t,e){if(e)for(const[n,s]of this.stealers){const r=this.state.bases[n];if(!r)continue;const a=21.5+r.player.ratings.speed*.062,o=(n+1)*90,l=r.player.ratings.stealing/100*.9,c=Math.min(o+89,Math.max(s,o+8*l)+a*t*Math.min(1,(s-o+5)/15));this.stealers.set(n,c)}}updatePitch(t,e){var l;const n=this.flight;this.pitchT+=t,this.updateStealers(t,!0);const s=this.state,r=ze(s),a=Ve(s);if(this.swing||(this.userSideBatting()&&e.swing&&this.pitchT<n.T+.05?(this.swing={type:e.swing,pci:{...this.pci},pressTime:this.pitchT},this.emit("swing",e.swing)):(l=this.aiPlan)!=null&&l.swing&&this.pitchT>=this.aiPlan.swing.pressTime&&(this.swing=this.aiPlan.swing,this.emit("swing",this.swing.type))),this.swing&&!this.swingResolved&&this.pitchT>=this.swing.pressTime+Vr){this.swingResolved=!0;const c=ud(r,a,n,this.swing,this.swingMods(),this.rng);if(this.contact=c,this.emit("contactResult",c.label,c.timing,{ev:c.ev,la:c.la,quality:c.quality,contact:c.contact}),c.contact){this.startBattedPlay(c);return}}const o=Ls(n,El);this.pitchT>=o&&!this.pitchDone&&(this.pitchDone=!0,this.resolveTakenPitch())}resolveTakenPitch(){const t=this.flight,e=this.state,n=!!this.swing;let s;!n&&t.hitsBatter?s="hbp":n?s="swinging_strike":s=t.isStrike?"called_strike":"ball",this.rules.countPitch(s!=="ball"&&s!=="hbp"),this.lastCall={ball:"BALL",called_strike:"STRIKE",swinging_strike:"STRIKE",foul:"FOUL",hbp:"HIT BY PITCH"}[s];const r=this.rules.applyPitch(s);this.paEnded=r!==null,this.emit("call",this.lastCall,`${e.balls}-${e.strikes}`,{call:s,ev:r}),r==="strikeout"&&this.emit("strikeout",$d(e),void 0,{risp:!!(e.bases[1]||e.bases[2])||e.outs>=3}),r==="walk"&&this.emit("walk");const a=e.bases.some(Boolean),o=Ir(Te(e)).C,l=t.wild?.28+(100-o.ratings.fielding)/260:.003,c=a&&r!=="walk"&&r!=="hbp"&&e.outs<3&&this.rng.chance(l)&&s!=="hbp",u=this.stealers.size>0&&r!=="walk"&&r!=="hbp"&&e.outs<3;if(c||u){this.startNonBattedPlay(c?"wild":"catcher");return}this.stealers.clear(),this.setPhase("postpitch")}afterPostpitch(){const t=this.rules.checkProgress();if(t==="final")return this.finishGame();if(t==="half")return this.endHalf();if(this.paEnded)return this.startAtBat();this.startPrepitch()}playConfigBase(){const t=this.state,e=Te(t);return{stadium:this.stadium,env:this.env,rng:this.rng,outsBefore:t.outs,defense:Ir(e),fieldingPenalty:Ad(e),pitcherId:e.pitcher.id,userDefense:this.userSidePitching(),userOffense:this.userSideBatting(),fieldingAssist:this.prefs.fieldingAssist,runningAssist:this.prefs.runningAssist,difficulty:this.settings.difficulty}}currentRunners(t){const e=this.state,n=[];for(let s=0;s<3;s++){const r=e.bases[s];if(!r)continue;const a=t?[10,16,10][s]:0,o=this.stealers.get(s)??(a?(s+1)*90+a:void 0);n.push({base:s+1,player:r.player,responsiblePitcherId:r.responsiblePitcherId,reachedOnError:r.reachedOnError,p:o,stealing:t&&this.stealers.has(s)})}return n}startBattedPlay(t){var o;const e=this.state,n=od({x:t.contactPoint.x,y:t.contactPoint.y,z:t.contactPoint.z},t.ev,t.la,t.spray,t.backspin,t.sidespin);this.play=new Pl({...this.playConfigBase(),runners:this.currentRunners(!0),batter:ze(e),batted:n,launchAngle:t.la,swingType:(o=this.swing)==null?void 0:o.type}),this.rules.countPitch(!0);const s=qd(n,this.env);this.hrInfo={name:ze(e).name,ev:t.ev,la:t.la,dist:s};const r=this.play.controlled,a=r?(100-r.fld)/100:.3;this.landingOffset={x:this.rng.gauss(a*9),z:this.rng.gauss(a*9)},this.emit("contact",t.label,void 0,{ev:t.ev,la:t.la,spray:t.spray,dist:s,quality:t.quality}),this.setPhase("live")}startNonBattedPlay(t){let e;if(t==="wild"){const n=this.rng.range(-.9,.9),s=this.rng.range(25,45);e={p:{x:this.flight.plate.x*.5,y:.4,z:-2.2},v:{x:Math.sin(n)*s*.6,y:4,z:-Math.cos(n)*s},backspin:0,sidespin:0,rolling:!1,bounces:1,stopped:!1},this.emit("wildpitch",this.flight.wild?"WILD PITCH":"PASSED BALL")}this.play=new Pl({...this.playConfigBase(),runners:this.currentRunners(!0),batter:null,start:t,wildBall:e}),this.hrInfo=null,this.setPhase("live")}updateLive(t,e){const n=this.play;this.userSideBatting()&&e.runnerCmd&&gd(n,e.runnerCmd.dir,e.runnerCmd.sel),n.update(t,this.userSidePitching()?e.defense:null);for(const s of n.events)this.emit("play:"+s.type,void 0,void 0,s.data);if(n.events=[],n.homeRun&&(n.t>7.5||e.skip&&n.t>1.2)){for(const s of n.activeRunners())n.scoreRunner(s);n.over=!0}n.over&&this.finishPlay()}finishPlay(){const t=this.play,e=t.outcome();this.lastOutcome=e;const n=this.state;if(e.kind==="foul"){this.lastCall="FOUL",this.paEnded=!1,this.rules.applyPitch("foul"),this.emit("call","FOUL",`${n.balls}-${n.strikes}`,{call:"foul"}),this.play=null,this.setPhase("postpitch");return}const s=t.cfg.batter,r=Fe(n).runs;this.rules.applyPlay(e,s?s.id:null);const a=Fe(n).runs-r;if(this.lastPlayNotable=e.notable,this.postplayDur=1.7,e.homeRun&&this.hrInfo)this.emit("homerun",this.hrInfo.name,void 0,{...this.hrInfo,runs:a}),this.postplayDur=4.2;else if(e.triplePlay)this.emit("banner","TRIPLE PLAY!","",{kind:"big"});else if(e.doublePlay)this.emit("banner","DOUBLE PLAY","",{kind:"big"});else if(e.notable.includes("robbed"))this.emit("banner","ROBBED!","Leaping catch at the wall",{kind:"big"});else if(e.notable.includes("diving"))this.emit("banner","DIVING CATCH!","",{kind:"big"});else if(s){const l={"1B":"SINGLE","2B":"DOUBLE","3B":"TRIPLE",GRD:"GROUND-RULE DOUBLE",ROE:"ERROR",FC:"FIELDER'S CHOICE"}[e.batterResult];l?this.emit("banner",l,e.description,{kind:"hit"}):e.sacFly?this.emit("banner","SAC FLY",e.description,{kind:"small"}):this.emit("banner",e.outs.length?"OUT":"",e.description,{kind:"small"})}else e.stolenBases.length&&this.emit("banner","STOLEN BASE","",{kind:"hit"}),e.caughtStealing.length&&this.emit("banner","CAUGHT STEALING","",{kind:"small"});a>0&&!e.homeRun&&this.emit("runsScored",`${a} run${a>1?"s":""} score${a>1?"":"s"}`),this.stealers.clear(),this.setPhase("postplay")}afterPlay(){const t=this.rules.checkProgress();if(this.play=null,t==="final")return this.finishGame();if(t==="half")return this.endHalf();if(this.lastOutcome&&this.lastOutcome.kind==="nonbatted"&&!this.paEnded)return this.startPrepitch();this.startAtBat()}endHalf(){const t=this.state;this.setPhase("half_end"),this.play=null;const e=t.half==="top"?"BOTTOM":"TOP",n=t.half==="top"?t.inning-1:t.inning;this.emit("halfEnd",`END OF ${e==="TOP"?"THE TOP":"THE"} ${Xd(n)}`,`${t.away.team.name} ${t.away.runs}, ${t.home.team.name} ${t.home.runs}`)}finishGame(){this.setPhase("final"),this.play=null;const t=this.state,e=t.winner==="home"?t.home:t.away,n=t.winner==="home"&&t.half==="bottom"&&t.outs<3;this.emit("final",n?"WALK-OFF!":"FINAL",`${e.team.city} ${e.team.name} win ${Math.max(t.home.runs,t.away.runs)}–${Math.min(t.home.runs,t.away.runs)}`)}substitute(t,e,n,s){const r=this.state[t],a=r.lineup[e],o=Qe(n);if(r.removed.has(n)||r.lineup.some(l=>l.player.id===n))return!1;r.removed.add(a.player.id);for(const l of this.state.bases)l&&l.player.id===a.player.id&&(l.player=o);return r.lineup[e]={player:o,pos:s??a.pos},this.stats.addBatter(t,o.id),this.emit("toast",`${o.name} replaces ${a.player.name}`),!0}swapPositions(t,e,n){const s=this.state[t],r=s.lineup[e].pos;s.lineup[e].pos=s.lineup[n].pos,s.lineup[n].pos=r}bringInPitcher(t,e){const n=this.state[t],s=Qe(e);n.removed.has(s.id)||n.pitcher.id===s.id||this.changePitcher(n,s)}warmUp(t,e){this.state[t].warming=e}simulateHalfInning(){if(this.state.over)return;const t=this.state,e=t.half,n=t.inning;this.play=null;let s=0;for(;!t.over&&t.half===e&&t.inning===n&&s++<60;){for(const a of[t.home,t.away]){const o=Il(t,a);Te(t)===a&&o&&this.rules.changePitcher(a,o)}t.balls=0,t.strikes=0,kd(t,this.rules,this.rng);const r=this.rules.checkProgress();if(r==="final"){this.finishGame();return}if(r==="half")break}this.emit("toast","Half-inning simulated"),this.endHalf()}simulateToEnd(){let t=0;for(;!this.state.over&&t++<80;)this.simulateHalfInning();this.state.over&&this.finishGame()}snapshot(){const t=this.state,e=[],n=Te(t),s=Fe(t),r=Ir(n),a=h=>h.bats==="S"?"R":h.bats,o=(h,d,f,g,v,m,p,M=0,b=0,x={})=>({id:h.id+"",side:d,kind:f,x:g,z:v,y:0,facing:m,anim:p,animT:M,speed:b,number:h.number,bats:a(h),throws:h.throws,hasBall:!1,controlled:!1,...x});let l={x:0,y:0,z:0,visible:!1,trail:!1,color:"#ffffff",speed:0},c=null;const u=this.play;if(u&&(this.phase==="live"||this.phase==="postplay")){for(const f of u.fielders){let g="ready",v=0;const m=Math.hypot(f.vx,f.vz);f.down>0?g="down":f.dive>0?(g="dive",v=1-f.dive/.42):f.jump>0?(g="jump",v=1-f.jump/.6):f.throwAnim>0?(g="throw",v=1-f.throwAnim/.4):f.catchAnim>0?(g="catch",v=1-f.catchAnim/.35):m>2?g="run":f.pos==="C"&&!u.cfg.batter&&u.t<.3&&(g="crouch"),e.push(o(f.player,n.side,"fielder",f.x,f.z,f.facing,g,v,m,{pos:f.pos,hasBall:f.hasBall,controlled:u.controlled===f&&u.cfg.userDefense}))}for(const f of u.runners){if(f.scored&&u.t-f.scoreTime>1.2)continue;if(f.out&&u.t>0){const E=u.outs.find(T=>T.runnerId===f.id);if(E&&u.t-E.time>1.5)continue}const g=hi(f.p),v=f.delay<=0&&Math.abs(f.goal-f.p)>.05&&!f.out,m=f.goal>=f.p?1:-1,p=hi(Math.min(360,Math.max(0,f.p+m*2))),M=Math.atan2(p.x-g.x,p.z-g.z),b=f.slide>0?"slide":f.out?"idle":v?f.trot?"trot":"run":"idle",x=this.runnerSel!==null&&(f.startBase===this.runnerSel||Math.round(f.p/90)===this.runnerSel);if(e.push(o(f.player,s.side,"runner",g.x,g.z,f.isBatter&&f.delay>0?a(f.player)==="R"?Math.PI/2:-Math.PI/2:M,f.isBatter&&f.delay>0?"swing":b,f.isBatter&&f.delay>0?1:1-f.slide/.55,v?f.v:0,{selected:x&&u.cfg.userOffense})),f.isBatter&&f.delay>0){const E=e[e.length-1];E.x=a(f.player)==="R"?-2.7:2.7,E.z=.6,E.kind="batter"}}const h=u.ball,d=h.phys.v;if(l={x:h.phys.p.x,y:h.phys.p.y,z:h.phys.p.z,visible:h.mode!=="held",trail:h.mode!=="held"&&Math.hypot(d.x,d.y,d.z)>60,color:"#ffffff",speed:Math.hypot(d.x,d.y,d.z)},h.mode==="loose"&&h.battedInAir&&h.path.length){const f=u.t-h.pathT0;let g=null;for(let v=1;v<h.path.length;v++){const m=h.path[v];if(!(m.t<f)&&(m.event==="bounce"||m.event==="homerun"||m.event==="outofplay"||m.event==="wall")){g=m;break}}if(g){const v=Math.max(0,g.t-f);c={x:g.x+this.landingOffset.x*Math.min(1,v/2),z:g.z+this.landingOffset.z*Math.min(1,v/2),r:2.6+v*5}}}}else{const h=ch(this.stadium);for(const m of hh){const p=r[m],M=h[m];let b="ready",x=0,E=M.x,T=M.z,C=Math.PI;m==="P"&&(E=0,T=60.5,this.phase==="windup"?(b="pitch",x=Xt(this.phaseT/oa,0,1)*.8):this.phase==="pitch"||this.phase==="postpitch"?(b="pitch",x=.8+Xt(this.pitchT/.6,0,1)*.2,T=58.5):b="idle"),m==="C"&&(b="crouch",T=-3.4,C=0),e.push(o(p,n.side,"fielder",E,T,C,b,x,0,{pos:m,hasBall:m==="P"&&this.phase!=="pitch"&&this.phase!=="postpitch"}))}const d=ze(t),f=Wr(d,n.pitcher);let g="bat",v=0;this.swing&&(this.phase==="pitch"||this.phase==="postpitch")&&(g="swing",v=Xt((this.pitchT-this.swing.pressTime)/(Vr*2.2),0,1)),e.push(o(d,s.side,"batter",f==="R"?-2.7:2.7,.6,f==="R"?Math.PI/2:-Math.PI/2,g,v,0,{bats:f}));for(let m=0;m<3;m++){const p=t.bases[m];if(!p)continue;const M=this.stealers.get(m),b=hi(M??(m+1)*90+6),x=M!==void 0&&M>(m+1)*90+8,E=hi((m+1)*90+10),T=this.runnerSel===m+1;e.push(o(p.player,s.side,"runner",b.x,b.z,Math.atan2(E.x-b.x,E.z-b.z),x?"run":"idle",0,x?25:0,{selected:T&&this.userSideBatting()}))}if(this.flight&&(this.phase==="pitch"||this.phase==="postpitch")){const m=Ls(this.flight,El),p=Math.min(this.pitchT,m),M=As(this.flight,p);l={x:M.x,y:M.y,z:M.z,visible:this.pitchT<m+.4,trail:this.pitchT<m,color:ye[this.flight.code].color,speed:this.flight.mph*ss}}}return e.push({id:"ump-hp",side:"ump",kind:"umpire",x:0,z:-6.2,y:0,facing:0,anim:"crouch",animT:0,speed:0,number:0,bats:"R",throws:"R",hasBall:!1,controlled:!1}),e.push({id:"ump-1b",side:"ump",kind:"umpire",x:78,z:52,y:0,facing:-1,anim:"ready",animT:0,speed:0,number:0,bats:"R",throws:"R",hasBall:!1,controlled:!1}),{t:this.clock,actors:e,ball:l,landing:c}}}function $d(i){return Ve(i).name}function Xd(i){const t=["TH","ST","ND","RD"],e=i%100;return i+(t[(e-20)%10]||t[e]||t[0])}function qd(i,t){const e={...t,stadium:{...t.stadium,dims:[999,999,999,999,999],walls:[1,1,1,1,1],wallZones:void 0,foulWidth:999,backstop:999}},n={...i,p:{...i.p},v:{...i.v}};for(let s=0;s<4e3&&!(Gr(n,.004166666666666667,e)==="bounce"||n.rolling);s++);return Math.hypot(n.p.x,n.p.z)}class Bl{constructor(){I(this,"rec",[]);I(this,"last",[]);I(this,"lastNotable",[]);I(this,"recording",!1);I(this,"active",!1);I(this,"t",0);I(this,"speed",1);I(this,"paused",!1)}start(){this.rec=[],this.recording=!0}push(t,e){this.recording&&(this.rec.push({dt:t,snap:structuredClone(e)}),this.rec.length>2400&&this.rec.shift())}commit(t){this.rec.length>20&&(this.last=this.rec,this.lastNotable=t),this.rec=[],this.recording=!1}get duration(){return this.last.reduce((t,e)=>t+e.dt,0)}open(){return this.last.length?(this.active=!0,this.t=0,this.speed=1,this.paused=!1,!0):!1}close(){this.active=!1}step(t){this.paused||(this.t+=t*this.speed);const e=this.duration;this.t>e+.6&&(this.t=0),this.t<0&&(this.t=0)}scrub(t){this.t=Math.max(0,Math.min(this.duration,this.t+t))}frame(){if(!this.last.length)return null;let t=0;for(const e of this.last)if(t+=e.dt,t>=this.t)return e.snap;return this.last[this.last.length-1].snap}}/**
 * @license
 * Copyright 2010-2025 Three.js Authors
 * SPDX-License-Identifier: MIT
 */const Qo="180",Yd=0,Ul=1,Jd=2,yh=1,Mh=2,Pn=3,Yn=0,Ie=1,Pe=2,$n=0,$i=1,Qa=2,Nl=3,Ol=4,Kd=5,li=100,Zd=101,jd=102,Qd=103,tf=104,ef=200,nf=201,sf=202,rf=203,to=204,eo=205,af=206,of=207,lf=208,cf=209,hf=210,uf=211,df=212,ff=213,pf=214,no=0,io=1,so=2,Zi=3,ro=4,ao=5,oo=6,lo=7,bh=0,mf=1,gf=2,Xn=0,vf=1,Sf=2,xf=3,Rh=4,_f=5,yf=6,Mf=7,wh=300,ji=301,Qi=302,co=303,ho=304,jr=306,ts=1e3,ui=1001,uo=1002,tn=1003,bf=1004,qs=1005,gn=1006,la=1007,di=1008,yn=1009,Eh=1010,Th=1011,Is=1012,tl=1013,pi=1014,vn=1015,Gs=1016,el=1017,nl=1018,Ds=1020,Ch=35902,Ah=35899,Lh=1021,Ph=1022,dn=1023,Bs=1026,Us=1027,il=1028,sl=1029,Fh=1030,rl=1031,al=1033,Dr=33776,Br=33777,Ur=33778,Nr=33779,fo=35840,po=35841,mo=35842,go=35843,vo=36196,So=37492,xo=37496,_o=37808,yo=37809,Mo=37810,bo=37811,Ro=37812,wo=37813,Eo=37814,To=37815,Co=37816,Ao=37817,Lo=37818,Po=37819,Fo=37820,Io=37821,Do=36492,Bo=36494,Uo=36495,No=36283,Oo=36284,zo=36285,ko=36286,Rf=3200,wf=3201,Ih=0,Ef=1,Gn="",Me="srgb",es="srgb-linear",$r="linear",ae="srgb",Mi=7680,zl=519,Tf=512,Cf=513,Af=514,Dh=515,Lf=516,Pf=517,Ff=518,If=519,Ho=35044,kl="300 es",Sn=2e3,Xr=2001;class rs{addEventListener(t,e){this._listeners===void 0&&(this._listeners={});const n=this._listeners;n[t]===void 0&&(n[t]=[]),n[t].indexOf(e)===-1&&n[t].push(e)}hasEventListener(t,e){const n=this._listeners;return n===void 0?!1:n[t]!==void 0&&n[t].indexOf(e)!==-1}removeEventListener(t,e){const n=this._listeners;if(n===void 0)return;const s=n[t];if(s!==void 0){const r=s.indexOf(e);r!==-1&&s.splice(r,1)}}dispatchEvent(t){const e=this._listeners;if(e===void 0)return;const n=e[t.type];if(n!==void 0){t.target=this;const s=n.slice(0);for(let r=0,a=s.length;r<a;r++)s[r].call(this,t);t.target=null}}}const Ce=["00","01","02","03","04","05","06","07","08","09","0a","0b","0c","0d","0e","0f","10","11","12","13","14","15","16","17","18","19","1a","1b","1c","1d","1e","1f","20","21","22","23","24","25","26","27","28","29","2a","2b","2c","2d","2e","2f","30","31","32","33","34","35","36","37","38","39","3a","3b","3c","3d","3e","3f","40","41","42","43","44","45","46","47","48","49","4a","4b","4c","4d","4e","4f","50","51","52","53","54","55","56","57","58","59","5a","5b","5c","5d","5e","5f","60","61","62","63","64","65","66","67","68","69","6a","6b","6c","6d","6e","6f","70","71","72","73","74","75","76","77","78","79","7a","7b","7c","7d","7e","7f","80","81","82","83","84","85","86","87","88","89","8a","8b","8c","8d","8e","8f","90","91","92","93","94","95","96","97","98","99","9a","9b","9c","9d","9e","9f","a0","a1","a2","a3","a4","a5","a6","a7","a8","a9","aa","ab","ac","ad","ae","af","b0","b1","b2","b3","b4","b5","b6","b7","b8","b9","ba","bb","bc","bd","be","bf","c0","c1","c2","c3","c4","c5","c6","c7","c8","c9","ca","cb","cc","cd","ce","cf","d0","d1","d2","d3","d4","d5","d6","d7","d8","d9","da","db","dc","dd","de","df","e0","e1","e2","e3","e4","e5","e6","e7","e8","e9","ea","eb","ec","ed","ee","ef","f0","f1","f2","f3","f4","f5","f6","f7","f8","f9","fa","fb","fc","fd","fe","ff"],ca=Math.PI/180,Go=180/Math.PI;function Fn(){const i=Math.random()*4294967295|0,t=Math.random()*4294967295|0,e=Math.random()*4294967295|0,n=Math.random()*4294967295|0;return(Ce[i&255]+Ce[i>>8&255]+Ce[i>>16&255]+Ce[i>>24&255]+"-"+Ce[t&255]+Ce[t>>8&255]+"-"+Ce[t>>16&15|64]+Ce[t>>24&255]+"-"+Ce[e&63|128]+Ce[e>>8&255]+"-"+Ce[e>>16&255]+Ce[e>>24&255]+Ce[n&255]+Ce[n>>8&255]+Ce[n>>16&255]+Ce[n>>24&255]).toLowerCase()}function Wt(i,t,e){return Math.max(t,Math.min(e,i))}function Df(i,t){return(i%t+t)%t}function ha(i,t,e){return(1-e)*i+e*t}function mn(i,t){switch(t.constructor){case Float32Array:return i;case Uint32Array:return i/4294967295;case Uint16Array:return i/65535;case Uint8Array:return i/255;case Int32Array:return Math.max(i/2147483647,-1);case Int16Array:return Math.max(i/32767,-1);case Int8Array:return Math.max(i/127,-1);default:throw new Error("Invalid component type.")}}function oe(i,t){switch(t.constructor){case Float32Array:return i;case Uint32Array:return Math.round(i*4294967295);case Uint16Array:return Math.round(i*65535);case Uint8Array:return Math.round(i*255);case Int32Array:return Math.round(i*2147483647);case Int16Array:return Math.round(i*32767);case Int8Array:return Math.round(i*127);default:throw new Error("Invalid component type.")}}class ft{constructor(t=0,e=0){ft.prototype.isVector2=!0,this.x=t,this.y=e}get width(){return this.x}set width(t){this.x=t}get height(){return this.y}set height(t){this.y=t}set(t,e){return this.x=t,this.y=e,this}setScalar(t){return this.x=t,this.y=t,this}setX(t){return this.x=t,this}setY(t){return this.y=t,this}setComponent(t,e){switch(t){case 0:this.x=e;break;case 1:this.y=e;break;default:throw new Error("index is out of range: "+t)}return this}getComponent(t){switch(t){case 0:return this.x;case 1:return this.y;default:throw new Error("index is out of range: "+t)}}clone(){return new this.constructor(this.x,this.y)}copy(t){return this.x=t.x,this.y=t.y,this}add(t){return this.x+=t.x,this.y+=t.y,this}addScalar(t){return this.x+=t,this.y+=t,this}addVectors(t,e){return this.x=t.x+e.x,this.y=t.y+e.y,this}addScaledVector(t,e){return this.x+=t.x*e,this.y+=t.y*e,this}sub(t){return this.x-=t.x,this.y-=t.y,this}subScalar(t){return this.x-=t,this.y-=t,this}subVectors(t,e){return this.x=t.x-e.x,this.y=t.y-e.y,this}multiply(t){return this.x*=t.x,this.y*=t.y,this}multiplyScalar(t){return this.x*=t,this.y*=t,this}divide(t){return this.x/=t.x,this.y/=t.y,this}divideScalar(t){return this.multiplyScalar(1/t)}applyMatrix3(t){const e=this.x,n=this.y,s=t.elements;return this.x=s[0]*e+s[3]*n+s[6],this.y=s[1]*e+s[4]*n+s[7],this}min(t){return this.x=Math.min(this.x,t.x),this.y=Math.min(this.y,t.y),this}max(t){return this.x=Math.max(this.x,t.x),this.y=Math.max(this.y,t.y),this}clamp(t,e){return this.x=Wt(this.x,t.x,e.x),this.y=Wt(this.y,t.y,e.y),this}clampScalar(t,e){return this.x=Wt(this.x,t,e),this.y=Wt(this.y,t,e),this}clampLength(t,e){const n=this.length();return this.divideScalar(n||1).multiplyScalar(Wt(n,t,e))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this}negate(){return this.x=-this.x,this.y=-this.y,this}dot(t){return this.x*t.x+this.y*t.y}cross(t){return this.x*t.y-this.y*t.x}lengthSq(){return this.x*this.x+this.y*this.y}length(){return Math.sqrt(this.x*this.x+this.y*this.y)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)}normalize(){return this.divideScalar(this.length()||1)}angle(){return Math.atan2(-this.y,-this.x)+Math.PI}angleTo(t){const e=Math.sqrt(this.lengthSq()*t.lengthSq());if(e===0)return Math.PI/2;const n=this.dot(t)/e;return Math.acos(Wt(n,-1,1))}distanceTo(t){return Math.sqrt(this.distanceToSquared(t))}distanceToSquared(t){const e=this.x-t.x,n=this.y-t.y;return e*e+n*n}manhattanDistanceTo(t){return Math.abs(this.x-t.x)+Math.abs(this.y-t.y)}setLength(t){return this.normalize().multiplyScalar(t)}lerp(t,e){return this.x+=(t.x-this.x)*e,this.y+=(t.y-this.y)*e,this}lerpVectors(t,e,n){return this.x=t.x+(e.x-t.x)*n,this.y=t.y+(e.y-t.y)*n,this}equals(t){return t.x===this.x&&t.y===this.y}fromArray(t,e=0){return this.x=t[e],this.y=t[e+1],this}toArray(t=[],e=0){return t[e]=this.x,t[e+1]=this.y,t}fromBufferAttribute(t,e){return this.x=t.getX(e),this.y=t.getY(e),this}rotateAround(t,e){const n=Math.cos(e),s=Math.sin(e),r=this.x-t.x,a=this.y-t.y;return this.x=r*n-a*s+t.x,this.y=r*s+a*n+t.y,this}random(){return this.x=Math.random(),this.y=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y}}class Vs{constructor(t=0,e=0,n=0,s=1){this.isQuaternion=!0,this._x=t,this._y=e,this._z=n,this._w=s}static slerpFlat(t,e,n,s,r,a,o){let l=n[s+0],c=n[s+1],u=n[s+2],h=n[s+3];const d=r[a+0],f=r[a+1],g=r[a+2],v=r[a+3];if(o===0){t[e+0]=l,t[e+1]=c,t[e+2]=u,t[e+3]=h;return}if(o===1){t[e+0]=d,t[e+1]=f,t[e+2]=g,t[e+3]=v;return}if(h!==v||l!==d||c!==f||u!==g){let m=1-o;const p=l*d+c*f+u*g+h*v,M=p>=0?1:-1,b=1-p*p;if(b>Number.EPSILON){const E=Math.sqrt(b),T=Math.atan2(E,p*M);m=Math.sin(m*T)/E,o=Math.sin(o*T)/E}const x=o*M;if(l=l*m+d*x,c=c*m+f*x,u=u*m+g*x,h=h*m+v*x,m===1-o){const E=1/Math.sqrt(l*l+c*c+u*u+h*h);l*=E,c*=E,u*=E,h*=E}}t[e]=l,t[e+1]=c,t[e+2]=u,t[e+3]=h}static multiplyQuaternionsFlat(t,e,n,s,r,a){const o=n[s],l=n[s+1],c=n[s+2],u=n[s+3],h=r[a],d=r[a+1],f=r[a+2],g=r[a+3];return t[e]=o*g+u*h+l*f-c*d,t[e+1]=l*g+u*d+c*h-o*f,t[e+2]=c*g+u*f+o*d-l*h,t[e+3]=u*g-o*h-l*d-c*f,t}get x(){return this._x}set x(t){this._x=t,this._onChangeCallback()}get y(){return this._y}set y(t){this._y=t,this._onChangeCallback()}get z(){return this._z}set z(t){this._z=t,this._onChangeCallback()}get w(){return this._w}set w(t){this._w=t,this._onChangeCallback()}set(t,e,n,s){return this._x=t,this._y=e,this._z=n,this._w=s,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._w)}copy(t){return this._x=t.x,this._y=t.y,this._z=t.z,this._w=t.w,this._onChangeCallback(),this}setFromEuler(t,e=!0){const n=t._x,s=t._y,r=t._z,a=t._order,o=Math.cos,l=Math.sin,c=o(n/2),u=o(s/2),h=o(r/2),d=l(n/2),f=l(s/2),g=l(r/2);switch(a){case"XYZ":this._x=d*u*h+c*f*g,this._y=c*f*h-d*u*g,this._z=c*u*g+d*f*h,this._w=c*u*h-d*f*g;break;case"YXZ":this._x=d*u*h+c*f*g,this._y=c*f*h-d*u*g,this._z=c*u*g-d*f*h,this._w=c*u*h+d*f*g;break;case"ZXY":this._x=d*u*h-c*f*g,this._y=c*f*h+d*u*g,this._z=c*u*g+d*f*h,this._w=c*u*h-d*f*g;break;case"ZYX":this._x=d*u*h-c*f*g,this._y=c*f*h+d*u*g,this._z=c*u*g-d*f*h,this._w=c*u*h+d*f*g;break;case"YZX":this._x=d*u*h+c*f*g,this._y=c*f*h+d*u*g,this._z=c*u*g-d*f*h,this._w=c*u*h-d*f*g;break;case"XZY":this._x=d*u*h-c*f*g,this._y=c*f*h-d*u*g,this._z=c*u*g+d*f*h,this._w=c*u*h+d*f*g;break;default:console.warn("THREE.Quaternion: .setFromEuler() encountered an unknown order: "+a)}return e===!0&&this._onChangeCallback(),this}setFromAxisAngle(t,e){const n=e/2,s=Math.sin(n);return this._x=t.x*s,this._y=t.y*s,this._z=t.z*s,this._w=Math.cos(n),this._onChangeCallback(),this}setFromRotationMatrix(t){const e=t.elements,n=e[0],s=e[4],r=e[8],a=e[1],o=e[5],l=e[9],c=e[2],u=e[6],h=e[10],d=n+o+h;if(d>0){const f=.5/Math.sqrt(d+1);this._w=.25/f,this._x=(u-l)*f,this._y=(r-c)*f,this._z=(a-s)*f}else if(n>o&&n>h){const f=2*Math.sqrt(1+n-o-h);this._w=(u-l)/f,this._x=.25*f,this._y=(s+a)/f,this._z=(r+c)/f}else if(o>h){const f=2*Math.sqrt(1+o-n-h);this._w=(r-c)/f,this._x=(s+a)/f,this._y=.25*f,this._z=(l+u)/f}else{const f=2*Math.sqrt(1+h-n-o);this._w=(a-s)/f,this._x=(r+c)/f,this._y=(l+u)/f,this._z=.25*f}return this._onChangeCallback(),this}setFromUnitVectors(t,e){let n=t.dot(e)+1;return n<1e-8?(n=0,Math.abs(t.x)>Math.abs(t.z)?(this._x=-t.y,this._y=t.x,this._z=0,this._w=n):(this._x=0,this._y=-t.z,this._z=t.y,this._w=n)):(this._x=t.y*e.z-t.z*e.y,this._y=t.z*e.x-t.x*e.z,this._z=t.x*e.y-t.y*e.x,this._w=n),this.normalize()}angleTo(t){return 2*Math.acos(Math.abs(Wt(this.dot(t),-1,1)))}rotateTowards(t,e){const n=this.angleTo(t);if(n===0)return this;const s=Math.min(1,e/n);return this.slerp(t,s),this}identity(){return this.set(0,0,0,1)}invert(){return this.conjugate()}conjugate(){return this._x*=-1,this._y*=-1,this._z*=-1,this._onChangeCallback(),this}dot(t){return this._x*t._x+this._y*t._y+this._z*t._z+this._w*t._w}lengthSq(){return this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w}length(){return Math.sqrt(this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w)}normalize(){let t=this.length();return t===0?(this._x=0,this._y=0,this._z=0,this._w=1):(t=1/t,this._x=this._x*t,this._y=this._y*t,this._z=this._z*t,this._w=this._w*t),this._onChangeCallback(),this}multiply(t){return this.multiplyQuaternions(this,t)}premultiply(t){return this.multiplyQuaternions(t,this)}multiplyQuaternions(t,e){const n=t._x,s=t._y,r=t._z,a=t._w,o=e._x,l=e._y,c=e._z,u=e._w;return this._x=n*u+a*o+s*c-r*l,this._y=s*u+a*l+r*o-n*c,this._z=r*u+a*c+n*l-s*o,this._w=a*u-n*o-s*l-r*c,this._onChangeCallback(),this}slerp(t,e){if(e===0)return this;if(e===1)return this.copy(t);const n=this._x,s=this._y,r=this._z,a=this._w;let o=a*t._w+n*t._x+s*t._y+r*t._z;if(o<0?(this._w=-t._w,this._x=-t._x,this._y=-t._y,this._z=-t._z,o=-o):this.copy(t),o>=1)return this._w=a,this._x=n,this._y=s,this._z=r,this;const l=1-o*o;if(l<=Number.EPSILON){const f=1-e;return this._w=f*a+e*this._w,this._x=f*n+e*this._x,this._y=f*s+e*this._y,this._z=f*r+e*this._z,this.normalize(),this}const c=Math.sqrt(l),u=Math.atan2(c,o),h=Math.sin((1-e)*u)/c,d=Math.sin(e*u)/c;return this._w=a*h+this._w*d,this._x=n*h+this._x*d,this._y=s*h+this._y*d,this._z=r*h+this._z*d,this._onChangeCallback(),this}slerpQuaternions(t,e,n){return this.copy(t).slerp(e,n)}random(){const t=2*Math.PI*Math.random(),e=2*Math.PI*Math.random(),n=Math.random(),s=Math.sqrt(1-n),r=Math.sqrt(n);return this.set(s*Math.sin(t),s*Math.cos(t),r*Math.sin(e),r*Math.cos(e))}equals(t){return t._x===this._x&&t._y===this._y&&t._z===this._z&&t._w===this._w}fromArray(t,e=0){return this._x=t[e],this._y=t[e+1],this._z=t[e+2],this._w=t[e+3],this._onChangeCallback(),this}toArray(t=[],e=0){return t[e]=this._x,t[e+1]=this._y,t[e+2]=this._z,t[e+3]=this._w,t}fromBufferAttribute(t,e){return this._x=t.getX(e),this._y=t.getY(e),this._z=t.getZ(e),this._w=t.getW(e),this._onChangeCallback(),this}toJSON(){return this.toArray()}_onChange(t){return this._onChangeCallback=t,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._w}}class B{constructor(t=0,e=0,n=0){B.prototype.isVector3=!0,this.x=t,this.y=e,this.z=n}set(t,e,n){return n===void 0&&(n=this.z),this.x=t,this.y=e,this.z=n,this}setScalar(t){return this.x=t,this.y=t,this.z=t,this}setX(t){return this.x=t,this}setY(t){return this.y=t,this}setZ(t){return this.z=t,this}setComponent(t,e){switch(t){case 0:this.x=e;break;case 1:this.y=e;break;case 2:this.z=e;break;default:throw new Error("index is out of range: "+t)}return this}getComponent(t){switch(t){case 0:return this.x;case 1:return this.y;case 2:return this.z;default:throw new Error("index is out of range: "+t)}}clone(){return new this.constructor(this.x,this.y,this.z)}copy(t){return this.x=t.x,this.y=t.y,this.z=t.z,this}add(t){return this.x+=t.x,this.y+=t.y,this.z+=t.z,this}addScalar(t){return this.x+=t,this.y+=t,this.z+=t,this}addVectors(t,e){return this.x=t.x+e.x,this.y=t.y+e.y,this.z=t.z+e.z,this}addScaledVector(t,e){return this.x+=t.x*e,this.y+=t.y*e,this.z+=t.z*e,this}sub(t){return this.x-=t.x,this.y-=t.y,this.z-=t.z,this}subScalar(t){return this.x-=t,this.y-=t,this.z-=t,this}subVectors(t,e){return this.x=t.x-e.x,this.y=t.y-e.y,this.z=t.z-e.z,this}multiply(t){return this.x*=t.x,this.y*=t.y,this.z*=t.z,this}multiplyScalar(t){return this.x*=t,this.y*=t,this.z*=t,this}multiplyVectors(t,e){return this.x=t.x*e.x,this.y=t.y*e.y,this.z=t.z*e.z,this}applyEuler(t){return this.applyQuaternion(Hl.setFromEuler(t))}applyAxisAngle(t,e){return this.applyQuaternion(Hl.setFromAxisAngle(t,e))}applyMatrix3(t){const e=this.x,n=this.y,s=this.z,r=t.elements;return this.x=r[0]*e+r[3]*n+r[6]*s,this.y=r[1]*e+r[4]*n+r[7]*s,this.z=r[2]*e+r[5]*n+r[8]*s,this}applyNormalMatrix(t){return this.applyMatrix3(t).normalize()}applyMatrix4(t){const e=this.x,n=this.y,s=this.z,r=t.elements,a=1/(r[3]*e+r[7]*n+r[11]*s+r[15]);return this.x=(r[0]*e+r[4]*n+r[8]*s+r[12])*a,this.y=(r[1]*e+r[5]*n+r[9]*s+r[13])*a,this.z=(r[2]*e+r[6]*n+r[10]*s+r[14])*a,this}applyQuaternion(t){const e=this.x,n=this.y,s=this.z,r=t.x,a=t.y,o=t.z,l=t.w,c=2*(a*s-o*n),u=2*(o*e-r*s),h=2*(r*n-a*e);return this.x=e+l*c+a*h-o*u,this.y=n+l*u+o*c-r*h,this.z=s+l*h+r*u-a*c,this}project(t){return this.applyMatrix4(t.matrixWorldInverse).applyMatrix4(t.projectionMatrix)}unproject(t){return this.applyMatrix4(t.projectionMatrixInverse).applyMatrix4(t.matrixWorld)}transformDirection(t){const e=this.x,n=this.y,s=this.z,r=t.elements;return this.x=r[0]*e+r[4]*n+r[8]*s,this.y=r[1]*e+r[5]*n+r[9]*s,this.z=r[2]*e+r[6]*n+r[10]*s,this.normalize()}divide(t){return this.x/=t.x,this.y/=t.y,this.z/=t.z,this}divideScalar(t){return this.multiplyScalar(1/t)}min(t){return this.x=Math.min(this.x,t.x),this.y=Math.min(this.y,t.y),this.z=Math.min(this.z,t.z),this}max(t){return this.x=Math.max(this.x,t.x),this.y=Math.max(this.y,t.y),this.z=Math.max(this.z,t.z),this}clamp(t,e){return this.x=Wt(this.x,t.x,e.x),this.y=Wt(this.y,t.y,e.y),this.z=Wt(this.z,t.z,e.z),this}clampScalar(t,e){return this.x=Wt(this.x,t,e),this.y=Wt(this.y,t,e),this.z=Wt(this.z,t,e),this}clampLength(t,e){const n=this.length();return this.divideScalar(n||1).multiplyScalar(Wt(n,t,e))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this}dot(t){return this.x*t.x+this.y*t.y+this.z*t.z}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)}normalize(){return this.divideScalar(this.length()||1)}setLength(t){return this.normalize().multiplyScalar(t)}lerp(t,e){return this.x+=(t.x-this.x)*e,this.y+=(t.y-this.y)*e,this.z+=(t.z-this.z)*e,this}lerpVectors(t,e,n){return this.x=t.x+(e.x-t.x)*n,this.y=t.y+(e.y-t.y)*n,this.z=t.z+(e.z-t.z)*n,this}cross(t){return this.crossVectors(this,t)}crossVectors(t,e){const n=t.x,s=t.y,r=t.z,a=e.x,o=e.y,l=e.z;return this.x=s*l-r*o,this.y=r*a-n*l,this.z=n*o-s*a,this}projectOnVector(t){const e=t.lengthSq();if(e===0)return this.set(0,0,0);const n=t.dot(this)/e;return this.copy(t).multiplyScalar(n)}projectOnPlane(t){return ua.copy(this).projectOnVector(t),this.sub(ua)}reflect(t){return this.sub(ua.copy(t).multiplyScalar(2*this.dot(t)))}angleTo(t){const e=Math.sqrt(this.lengthSq()*t.lengthSq());if(e===0)return Math.PI/2;const n=this.dot(t)/e;return Math.acos(Wt(n,-1,1))}distanceTo(t){return Math.sqrt(this.distanceToSquared(t))}distanceToSquared(t){const e=this.x-t.x,n=this.y-t.y,s=this.z-t.z;return e*e+n*n+s*s}manhattanDistanceTo(t){return Math.abs(this.x-t.x)+Math.abs(this.y-t.y)+Math.abs(this.z-t.z)}setFromSpherical(t){return this.setFromSphericalCoords(t.radius,t.phi,t.theta)}setFromSphericalCoords(t,e,n){const s=Math.sin(e)*t;return this.x=s*Math.sin(n),this.y=Math.cos(e)*t,this.z=s*Math.cos(n),this}setFromCylindrical(t){return this.setFromCylindricalCoords(t.radius,t.theta,t.y)}setFromCylindricalCoords(t,e,n){return this.x=t*Math.sin(e),this.y=n,this.z=t*Math.cos(e),this}setFromMatrixPosition(t){const e=t.elements;return this.x=e[12],this.y=e[13],this.z=e[14],this}setFromMatrixScale(t){const e=this.setFromMatrixColumn(t,0).length(),n=this.setFromMatrixColumn(t,1).length(),s=this.setFromMatrixColumn(t,2).length();return this.x=e,this.y=n,this.z=s,this}setFromMatrixColumn(t,e){return this.fromArray(t.elements,e*4)}setFromMatrix3Column(t,e){return this.fromArray(t.elements,e*3)}setFromEuler(t){return this.x=t._x,this.y=t._y,this.z=t._z,this}setFromColor(t){return this.x=t.r,this.y=t.g,this.z=t.b,this}equals(t){return t.x===this.x&&t.y===this.y&&t.z===this.z}fromArray(t,e=0){return this.x=t[e],this.y=t[e+1],this.z=t[e+2],this}toArray(t=[],e=0){return t[e]=this.x,t[e+1]=this.y,t[e+2]=this.z,t}fromBufferAttribute(t,e){return this.x=t.getX(e),this.y=t.getY(e),this.z=t.getZ(e),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this}randomDirection(){const t=Math.random()*Math.PI*2,e=Math.random()*2-1,n=Math.sqrt(1-e*e);return this.x=n*Math.cos(t),this.y=e,this.z=n*Math.sin(t),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z}}const ua=new B,Hl=new Vs;class zt{constructor(t,e,n,s,r,a,o,l,c){zt.prototype.isMatrix3=!0,this.elements=[1,0,0,0,1,0,0,0,1],t!==void 0&&this.set(t,e,n,s,r,a,o,l,c)}set(t,e,n,s,r,a,o,l,c){const u=this.elements;return u[0]=t,u[1]=s,u[2]=o,u[3]=e,u[4]=r,u[5]=l,u[6]=n,u[7]=a,u[8]=c,this}identity(){return this.set(1,0,0,0,1,0,0,0,1),this}copy(t){const e=this.elements,n=t.elements;return e[0]=n[0],e[1]=n[1],e[2]=n[2],e[3]=n[3],e[4]=n[4],e[5]=n[5],e[6]=n[6],e[7]=n[7],e[8]=n[8],this}extractBasis(t,e,n){return t.setFromMatrix3Column(this,0),e.setFromMatrix3Column(this,1),n.setFromMatrix3Column(this,2),this}setFromMatrix4(t){const e=t.elements;return this.set(e[0],e[4],e[8],e[1],e[5],e[9],e[2],e[6],e[10]),this}multiply(t){return this.multiplyMatrices(this,t)}premultiply(t){return this.multiplyMatrices(t,this)}multiplyMatrices(t,e){const n=t.elements,s=e.elements,r=this.elements,a=n[0],o=n[3],l=n[6],c=n[1],u=n[4],h=n[7],d=n[2],f=n[5],g=n[8],v=s[0],m=s[3],p=s[6],M=s[1],b=s[4],x=s[7],E=s[2],T=s[5],C=s[8];return r[0]=a*v+o*M+l*E,r[3]=a*m+o*b+l*T,r[6]=a*p+o*x+l*C,r[1]=c*v+u*M+h*E,r[4]=c*m+u*b+h*T,r[7]=c*p+u*x+h*C,r[2]=d*v+f*M+g*E,r[5]=d*m+f*b+g*T,r[8]=d*p+f*x+g*C,this}multiplyScalar(t){const e=this.elements;return e[0]*=t,e[3]*=t,e[6]*=t,e[1]*=t,e[4]*=t,e[7]*=t,e[2]*=t,e[5]*=t,e[8]*=t,this}determinant(){const t=this.elements,e=t[0],n=t[1],s=t[2],r=t[3],a=t[4],o=t[5],l=t[6],c=t[7],u=t[8];return e*a*u-e*o*c-n*r*u+n*o*l+s*r*c-s*a*l}invert(){const t=this.elements,e=t[0],n=t[1],s=t[2],r=t[3],a=t[4],o=t[5],l=t[6],c=t[7],u=t[8],h=u*a-o*c,d=o*l-u*r,f=c*r-a*l,g=e*h+n*d+s*f;if(g===0)return this.set(0,0,0,0,0,0,0,0,0);const v=1/g;return t[0]=h*v,t[1]=(s*c-u*n)*v,t[2]=(o*n-s*a)*v,t[3]=d*v,t[4]=(u*e-s*l)*v,t[5]=(s*r-o*e)*v,t[6]=f*v,t[7]=(n*l-c*e)*v,t[8]=(a*e-n*r)*v,this}transpose(){let t;const e=this.elements;return t=e[1],e[1]=e[3],e[3]=t,t=e[2],e[2]=e[6],e[6]=t,t=e[5],e[5]=e[7],e[7]=t,this}getNormalMatrix(t){return this.setFromMatrix4(t).invert().transpose()}transposeIntoArray(t){const e=this.elements;return t[0]=e[0],t[1]=e[3],t[2]=e[6],t[3]=e[1],t[4]=e[4],t[5]=e[7],t[6]=e[2],t[7]=e[5],t[8]=e[8],this}setUvTransform(t,e,n,s,r,a,o){const l=Math.cos(r),c=Math.sin(r);return this.set(n*l,n*c,-n*(l*a+c*o)+a+t,-s*c,s*l,-s*(-c*a+l*o)+o+e,0,0,1),this}scale(t,e){return this.premultiply(da.makeScale(t,e)),this}rotate(t){return this.premultiply(da.makeRotation(-t)),this}translate(t,e){return this.premultiply(da.makeTranslation(t,e)),this}makeTranslation(t,e){return t.isVector2?this.set(1,0,t.x,0,1,t.y,0,0,1):this.set(1,0,t,0,1,e,0,0,1),this}makeRotation(t){const e=Math.cos(t),n=Math.sin(t);return this.set(e,-n,0,n,e,0,0,0,1),this}makeScale(t,e){return this.set(t,0,0,0,e,0,0,0,1),this}equals(t){const e=this.elements,n=t.elements;for(let s=0;s<9;s++)if(e[s]!==n[s])return!1;return!0}fromArray(t,e=0){for(let n=0;n<9;n++)this.elements[n]=t[n+e];return this}toArray(t=[],e=0){const n=this.elements;return t[e]=n[0],t[e+1]=n[1],t[e+2]=n[2],t[e+3]=n[3],t[e+4]=n[4],t[e+5]=n[5],t[e+6]=n[6],t[e+7]=n[7],t[e+8]=n[8],t}clone(){return new this.constructor().fromArray(this.elements)}}const da=new zt;function Bh(i){for(let t=i.length-1;t>=0;--t)if(i[t]>=65535)return!0;return!1}function qr(i){return document.createElementNS("http://www.w3.org/1999/xhtml",i)}function Bf(){const i=qr("canvas");return i.style.display="block",i}const Gl={};function Ns(i){i in Gl||(Gl[i]=!0,console.warn(i))}function Uf(i,t,e){return new Promise(function(n,s){function r(){switch(i.clientWaitSync(t,i.SYNC_FLUSH_COMMANDS_BIT,0)){case i.WAIT_FAILED:s();break;case i.TIMEOUT_EXPIRED:setTimeout(r,e);break;default:n()}}setTimeout(r,e)})}const Vl=new zt().set(.4123908,.3575843,.1804808,.212639,.7151687,.0721923,.0193308,.1191948,.9505322),Wl=new zt().set(3.2409699,-1.5373832,-.4986108,-.9692436,1.8759675,.0415551,.0556301,-.203977,1.0569715);function Nf(){const i={enabled:!0,workingColorSpace:es,spaces:{},convert:function(s,r,a){return this.enabled===!1||r===a||!r||!a||(this.spaces[r].transfer===ae&&(s.r=In(s.r),s.g=In(s.g),s.b=In(s.b)),this.spaces[r].primaries!==this.spaces[a].primaries&&(s.applyMatrix3(this.spaces[r].toXYZ),s.applyMatrix3(this.spaces[a].fromXYZ)),this.spaces[a].transfer===ae&&(s.r=Xi(s.r),s.g=Xi(s.g),s.b=Xi(s.b))),s},workingToColorSpace:function(s,r){return this.convert(s,this.workingColorSpace,r)},colorSpaceToWorking:function(s,r){return this.convert(s,r,this.workingColorSpace)},getPrimaries:function(s){return this.spaces[s].primaries},getTransfer:function(s){return s===Gn?$r:this.spaces[s].transfer},getToneMappingMode:function(s){return this.spaces[s].outputColorSpaceConfig.toneMappingMode||"standard"},getLuminanceCoefficients:function(s,r=this.workingColorSpace){return s.fromArray(this.spaces[r].luminanceCoefficients)},define:function(s){Object.assign(this.spaces,s)},_getMatrix:function(s,r,a){return s.copy(this.spaces[r].toXYZ).multiply(this.spaces[a].fromXYZ)},_getDrawingBufferColorSpace:function(s){return this.spaces[s].outputColorSpaceConfig.drawingBufferColorSpace},_getUnpackColorSpace:function(s=this.workingColorSpace){return this.spaces[s].workingColorSpaceConfig.unpackColorSpace},fromWorkingColorSpace:function(s,r){return Ns("THREE.ColorManagement: .fromWorkingColorSpace() has been renamed to .workingToColorSpace()."),i.workingToColorSpace(s,r)},toWorkingColorSpace:function(s,r){return Ns("THREE.ColorManagement: .toWorkingColorSpace() has been renamed to .colorSpaceToWorking()."),i.colorSpaceToWorking(s,r)}},t=[.64,.33,.3,.6,.15,.06],e=[.2126,.7152,.0722],n=[.3127,.329];return i.define({[es]:{primaries:t,whitePoint:n,transfer:$r,toXYZ:Vl,fromXYZ:Wl,luminanceCoefficients:e,workingColorSpaceConfig:{unpackColorSpace:Me},outputColorSpaceConfig:{drawingBufferColorSpace:Me}},[Me]:{primaries:t,whitePoint:n,transfer:ae,toXYZ:Vl,fromXYZ:Wl,luminanceCoefficients:e,outputColorSpaceConfig:{drawingBufferColorSpace:Me}}}),i}const Kt=Nf();function In(i){return i<.04045?i*.0773993808:Math.pow(i*.9478672986+.0521327014,2.4)}function Xi(i){return i<.0031308?i*12.92:1.055*Math.pow(i,.41666)-.055}let bi;class Of{static getDataURL(t,e="image/png"){if(/^data:/i.test(t.src)||typeof HTMLCanvasElement>"u")return t.src;let n;if(t instanceof HTMLCanvasElement)n=t;else{bi===void 0&&(bi=qr("canvas")),bi.width=t.width,bi.height=t.height;const s=bi.getContext("2d");t instanceof ImageData?s.putImageData(t,0,0):s.drawImage(t,0,0,t.width,t.height),n=bi}return n.toDataURL(e)}static sRGBToLinear(t){if(typeof HTMLImageElement<"u"&&t instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&t instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&t instanceof ImageBitmap){const e=qr("canvas");e.width=t.width,e.height=t.height;const n=e.getContext("2d");n.drawImage(t,0,0,t.width,t.height);const s=n.getImageData(0,0,t.width,t.height),r=s.data;for(let a=0;a<r.length;a++)r[a]=In(r[a]/255)*255;return n.putImageData(s,0,0),e}else if(t.data){const e=t.data.slice(0);for(let n=0;n<e.length;n++)e instanceof Uint8Array||e instanceof Uint8ClampedArray?e[n]=Math.floor(In(e[n]/255)*255):e[n]=In(e[n]);return{data:e,width:t.width,height:t.height}}else return console.warn("THREE.ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied."),t}}let zf=0;class ol{constructor(t=null){this.isSource=!0,Object.defineProperty(this,"id",{value:zf++}),this.uuid=Fn(),this.data=t,this.dataReady=!0,this.version=0}getSize(t){const e=this.data;return typeof HTMLVideoElement<"u"&&e instanceof HTMLVideoElement?t.set(e.videoWidth,e.videoHeight,0):e instanceof VideoFrame?t.set(e.displayHeight,e.displayWidth,0):e!==null?t.set(e.width,e.height,e.depth||0):t.set(0,0,0),t}set needsUpdate(t){t===!0&&this.version++}toJSON(t){const e=t===void 0||typeof t=="string";if(!e&&t.images[this.uuid]!==void 0)return t.images[this.uuid];const n={uuid:this.uuid,url:""},s=this.data;if(s!==null){let r;if(Array.isArray(s)){r=[];for(let a=0,o=s.length;a<o;a++)s[a].isDataTexture?r.push(fa(s[a].image)):r.push(fa(s[a]))}else r=fa(s);n.url=r}return e||(t.images[this.uuid]=n),n}}function fa(i){return typeof HTMLImageElement<"u"&&i instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&i instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&i instanceof ImageBitmap?Of.getDataURL(i):i.data?{data:Array.from(i.data),width:i.width,height:i.height,type:i.data.constructor.name}:(console.warn("THREE.Texture: Unable to serialize Texture."),{})}let kf=0;const pa=new B;class De extends rs{constructor(t=De.DEFAULT_IMAGE,e=De.DEFAULT_MAPPING,n=ui,s=ui,r=gn,a=di,o=dn,l=yn,c=De.DEFAULT_ANISOTROPY,u=Gn){super(),this.isTexture=!0,Object.defineProperty(this,"id",{value:kf++}),this.uuid=Fn(),this.name="",this.source=new ol(t),this.mipmaps=[],this.mapping=e,this.channel=0,this.wrapS=n,this.wrapT=s,this.magFilter=r,this.minFilter=a,this.anisotropy=c,this.format=o,this.internalFormat=null,this.type=l,this.offset=new ft(0,0),this.repeat=new ft(1,1),this.center=new ft(0,0),this.rotation=0,this.matrixAutoUpdate=!0,this.matrix=new zt,this.generateMipmaps=!0,this.premultiplyAlpha=!1,this.flipY=!0,this.unpackAlignment=4,this.colorSpace=u,this.userData={},this.updateRanges=[],this.version=0,this.onUpdate=null,this.renderTarget=null,this.isRenderTargetTexture=!1,this.isArrayTexture=!!(t&&t.depth&&t.depth>1),this.pmremVersion=0}get width(){return this.source.getSize(pa).x}get height(){return this.source.getSize(pa).y}get depth(){return this.source.getSize(pa).z}get image(){return this.source.data}set image(t=null){this.source.data=t}updateMatrix(){this.matrix.setUvTransform(this.offset.x,this.offset.y,this.repeat.x,this.repeat.y,this.rotation,this.center.x,this.center.y)}addUpdateRange(t,e){this.updateRanges.push({start:t,count:e})}clearUpdateRanges(){this.updateRanges.length=0}clone(){return new this.constructor().copy(this)}copy(t){return this.name=t.name,this.source=t.source,this.mipmaps=t.mipmaps.slice(0),this.mapping=t.mapping,this.channel=t.channel,this.wrapS=t.wrapS,this.wrapT=t.wrapT,this.magFilter=t.magFilter,this.minFilter=t.minFilter,this.anisotropy=t.anisotropy,this.format=t.format,this.internalFormat=t.internalFormat,this.type=t.type,this.offset.copy(t.offset),this.repeat.copy(t.repeat),this.center.copy(t.center),this.rotation=t.rotation,this.matrixAutoUpdate=t.matrixAutoUpdate,this.matrix.copy(t.matrix),this.generateMipmaps=t.generateMipmaps,this.premultiplyAlpha=t.premultiplyAlpha,this.flipY=t.flipY,this.unpackAlignment=t.unpackAlignment,this.colorSpace=t.colorSpace,this.renderTarget=t.renderTarget,this.isRenderTargetTexture=t.isRenderTargetTexture,this.isArrayTexture=t.isArrayTexture,this.userData=JSON.parse(JSON.stringify(t.userData)),this.needsUpdate=!0,this}setValues(t){for(const e in t){const n=t[e];if(n===void 0){console.warn(`THREE.Texture.setValues(): parameter '${e}' has value of undefined.`);continue}const s=this[e];if(s===void 0){console.warn(`THREE.Texture.setValues(): property '${e}' does not exist.`);continue}s&&n&&s.isVector2&&n.isVector2||s&&n&&s.isVector3&&n.isVector3||s&&n&&s.isMatrix3&&n.isMatrix3?s.copy(n):this[e]=n}}toJSON(t){const e=t===void 0||typeof t=="string";if(!e&&t.textures[this.uuid]!==void 0)return t.textures[this.uuid];const n={metadata:{version:4.7,type:"Texture",generator:"Texture.toJSON"},uuid:this.uuid,name:this.name,image:this.source.toJSON(t).uuid,mapping:this.mapping,channel:this.channel,repeat:[this.repeat.x,this.repeat.y],offset:[this.offset.x,this.offset.y],center:[this.center.x,this.center.y],rotation:this.rotation,wrap:[this.wrapS,this.wrapT],format:this.format,internalFormat:this.internalFormat,type:this.type,colorSpace:this.colorSpace,minFilter:this.minFilter,magFilter:this.magFilter,anisotropy:this.anisotropy,flipY:this.flipY,generateMipmaps:this.generateMipmaps,premultiplyAlpha:this.premultiplyAlpha,unpackAlignment:this.unpackAlignment};return Object.keys(this.userData).length>0&&(n.userData=this.userData),e||(t.textures[this.uuid]=n),n}dispose(){this.dispatchEvent({type:"dispose"})}transformUv(t){if(this.mapping!==wh)return t;if(t.applyMatrix3(this.matrix),t.x<0||t.x>1)switch(this.wrapS){case ts:t.x=t.x-Math.floor(t.x);break;case ui:t.x=t.x<0?0:1;break;case uo:Math.abs(Math.floor(t.x)%2)===1?t.x=Math.ceil(t.x)-t.x:t.x=t.x-Math.floor(t.x);break}if(t.y<0||t.y>1)switch(this.wrapT){case ts:t.y=t.y-Math.floor(t.y);break;case ui:t.y=t.y<0?0:1;break;case uo:Math.abs(Math.floor(t.y)%2)===1?t.y=Math.ceil(t.y)-t.y:t.y=t.y-Math.floor(t.y);break}return this.flipY&&(t.y=1-t.y),t}set needsUpdate(t){t===!0&&(this.version++,this.source.needsUpdate=!0)}set needsPMREMUpdate(t){t===!0&&this.pmremVersion++}}De.DEFAULT_IMAGE=null;De.DEFAULT_MAPPING=wh;De.DEFAULT_ANISOTROPY=1;class me{constructor(t=0,e=0,n=0,s=1){me.prototype.isVector4=!0,this.x=t,this.y=e,this.z=n,this.w=s}get width(){return this.z}set width(t){this.z=t}get height(){return this.w}set height(t){this.w=t}set(t,e,n,s){return this.x=t,this.y=e,this.z=n,this.w=s,this}setScalar(t){return this.x=t,this.y=t,this.z=t,this.w=t,this}setX(t){return this.x=t,this}setY(t){return this.y=t,this}setZ(t){return this.z=t,this}setW(t){return this.w=t,this}setComponent(t,e){switch(t){case 0:this.x=e;break;case 1:this.y=e;break;case 2:this.z=e;break;case 3:this.w=e;break;default:throw new Error("index is out of range: "+t)}return this}getComponent(t){switch(t){case 0:return this.x;case 1:return this.y;case 2:return this.z;case 3:return this.w;default:throw new Error("index is out of range: "+t)}}clone(){return new this.constructor(this.x,this.y,this.z,this.w)}copy(t){return this.x=t.x,this.y=t.y,this.z=t.z,this.w=t.w!==void 0?t.w:1,this}add(t){return this.x+=t.x,this.y+=t.y,this.z+=t.z,this.w+=t.w,this}addScalar(t){return this.x+=t,this.y+=t,this.z+=t,this.w+=t,this}addVectors(t,e){return this.x=t.x+e.x,this.y=t.y+e.y,this.z=t.z+e.z,this.w=t.w+e.w,this}addScaledVector(t,e){return this.x+=t.x*e,this.y+=t.y*e,this.z+=t.z*e,this.w+=t.w*e,this}sub(t){return this.x-=t.x,this.y-=t.y,this.z-=t.z,this.w-=t.w,this}subScalar(t){return this.x-=t,this.y-=t,this.z-=t,this.w-=t,this}subVectors(t,e){return this.x=t.x-e.x,this.y=t.y-e.y,this.z=t.z-e.z,this.w=t.w-e.w,this}multiply(t){return this.x*=t.x,this.y*=t.y,this.z*=t.z,this.w*=t.w,this}multiplyScalar(t){return this.x*=t,this.y*=t,this.z*=t,this.w*=t,this}applyMatrix4(t){const e=this.x,n=this.y,s=this.z,r=this.w,a=t.elements;return this.x=a[0]*e+a[4]*n+a[8]*s+a[12]*r,this.y=a[1]*e+a[5]*n+a[9]*s+a[13]*r,this.z=a[2]*e+a[6]*n+a[10]*s+a[14]*r,this.w=a[3]*e+a[7]*n+a[11]*s+a[15]*r,this}divide(t){return this.x/=t.x,this.y/=t.y,this.z/=t.z,this.w/=t.w,this}divideScalar(t){return this.multiplyScalar(1/t)}setAxisAngleFromQuaternion(t){this.w=2*Math.acos(t.w);const e=Math.sqrt(1-t.w*t.w);return e<1e-4?(this.x=1,this.y=0,this.z=0):(this.x=t.x/e,this.y=t.y/e,this.z=t.z/e),this}setAxisAngleFromRotationMatrix(t){let e,n,s,r;const l=t.elements,c=l[0],u=l[4],h=l[8],d=l[1],f=l[5],g=l[9],v=l[2],m=l[6],p=l[10];if(Math.abs(u-d)<.01&&Math.abs(h-v)<.01&&Math.abs(g-m)<.01){if(Math.abs(u+d)<.1&&Math.abs(h+v)<.1&&Math.abs(g+m)<.1&&Math.abs(c+f+p-3)<.1)return this.set(1,0,0,0),this;e=Math.PI;const b=(c+1)/2,x=(f+1)/2,E=(p+1)/2,T=(u+d)/4,C=(h+v)/4,A=(g+m)/4;return b>x&&b>E?b<.01?(n=0,s=.707106781,r=.707106781):(n=Math.sqrt(b),s=T/n,r=C/n):x>E?x<.01?(n=.707106781,s=0,r=.707106781):(s=Math.sqrt(x),n=T/s,r=A/s):E<.01?(n=.707106781,s=.707106781,r=0):(r=Math.sqrt(E),n=C/r,s=A/r),this.set(n,s,r,e),this}let M=Math.sqrt((m-g)*(m-g)+(h-v)*(h-v)+(d-u)*(d-u));return Math.abs(M)<.001&&(M=1),this.x=(m-g)/M,this.y=(h-v)/M,this.z=(d-u)/M,this.w=Math.acos((c+f+p-1)/2),this}setFromMatrixPosition(t){const e=t.elements;return this.x=e[12],this.y=e[13],this.z=e[14],this.w=e[15],this}min(t){return this.x=Math.min(this.x,t.x),this.y=Math.min(this.y,t.y),this.z=Math.min(this.z,t.z),this.w=Math.min(this.w,t.w),this}max(t){return this.x=Math.max(this.x,t.x),this.y=Math.max(this.y,t.y),this.z=Math.max(this.z,t.z),this.w=Math.max(this.w,t.w),this}clamp(t,e){return this.x=Wt(this.x,t.x,e.x),this.y=Wt(this.y,t.y,e.y),this.z=Wt(this.z,t.z,e.z),this.w=Wt(this.w,t.w,e.w),this}clampScalar(t,e){return this.x=Wt(this.x,t,e),this.y=Wt(this.y,t,e),this.z=Wt(this.z,t,e),this.w=Wt(this.w,t,e),this}clampLength(t,e){const n=this.length();return this.divideScalar(n||1).multiplyScalar(Wt(n,t,e))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this.w=Math.floor(this.w),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this.w=Math.ceil(this.w),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this.w=Math.round(this.w),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this.w=Math.trunc(this.w),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this.w=-this.w,this}dot(t){return this.x*t.x+this.y*t.y+this.z*t.z+this.w*t.w}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)+Math.abs(this.w)}normalize(){return this.divideScalar(this.length()||1)}setLength(t){return this.normalize().multiplyScalar(t)}lerp(t,e){return this.x+=(t.x-this.x)*e,this.y+=(t.y-this.y)*e,this.z+=(t.z-this.z)*e,this.w+=(t.w-this.w)*e,this}lerpVectors(t,e,n){return this.x=t.x+(e.x-t.x)*n,this.y=t.y+(e.y-t.y)*n,this.z=t.z+(e.z-t.z)*n,this.w=t.w+(e.w-t.w)*n,this}equals(t){return t.x===this.x&&t.y===this.y&&t.z===this.z&&t.w===this.w}fromArray(t,e=0){return this.x=t[e],this.y=t[e+1],this.z=t[e+2],this.w=t[e+3],this}toArray(t=[],e=0){return t[e]=this.x,t[e+1]=this.y,t[e+2]=this.z,t[e+3]=this.w,t}fromBufferAttribute(t,e){return this.x=t.getX(e),this.y=t.getY(e),this.z=t.getZ(e),this.w=t.getW(e),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this.w=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z,yield this.w}}class Hf extends rs{constructor(t=1,e=1,n={}){super(),n=Object.assign({generateMipmaps:!1,internalFormat:null,minFilter:gn,depthBuffer:!0,stencilBuffer:!1,resolveDepthBuffer:!0,resolveStencilBuffer:!0,depthTexture:null,samples:0,count:1,depth:1,multiview:!1},n),this.isRenderTarget=!0,this.width=t,this.height=e,this.depth=n.depth,this.scissor=new me(0,0,t,e),this.scissorTest=!1,this.viewport=new me(0,0,t,e);const s={width:t,height:e,depth:n.depth},r=new De(s);this.textures=[];const a=n.count;for(let o=0;o<a;o++)this.textures[o]=r.clone(),this.textures[o].isRenderTargetTexture=!0,this.textures[o].renderTarget=this;this._setTextureOptions(n),this.depthBuffer=n.depthBuffer,this.stencilBuffer=n.stencilBuffer,this.resolveDepthBuffer=n.resolveDepthBuffer,this.resolveStencilBuffer=n.resolveStencilBuffer,this._depthTexture=null,this.depthTexture=n.depthTexture,this.samples=n.samples,this.multiview=n.multiview}_setTextureOptions(t={}){const e={minFilter:gn,generateMipmaps:!1,flipY:!1,internalFormat:null};t.mapping!==void 0&&(e.mapping=t.mapping),t.wrapS!==void 0&&(e.wrapS=t.wrapS),t.wrapT!==void 0&&(e.wrapT=t.wrapT),t.wrapR!==void 0&&(e.wrapR=t.wrapR),t.magFilter!==void 0&&(e.magFilter=t.magFilter),t.minFilter!==void 0&&(e.minFilter=t.minFilter),t.format!==void 0&&(e.format=t.format),t.type!==void 0&&(e.type=t.type),t.anisotropy!==void 0&&(e.anisotropy=t.anisotropy),t.colorSpace!==void 0&&(e.colorSpace=t.colorSpace),t.flipY!==void 0&&(e.flipY=t.flipY),t.generateMipmaps!==void 0&&(e.generateMipmaps=t.generateMipmaps),t.internalFormat!==void 0&&(e.internalFormat=t.internalFormat);for(let n=0;n<this.textures.length;n++)this.textures[n].setValues(e)}get texture(){return this.textures[0]}set texture(t){this.textures[0]=t}set depthTexture(t){this._depthTexture!==null&&(this._depthTexture.renderTarget=null),t!==null&&(t.renderTarget=this),this._depthTexture=t}get depthTexture(){return this._depthTexture}setSize(t,e,n=1){if(this.width!==t||this.height!==e||this.depth!==n){this.width=t,this.height=e,this.depth=n;for(let s=0,r=this.textures.length;s<r;s++)this.textures[s].image.width=t,this.textures[s].image.height=e,this.textures[s].image.depth=n,this.textures[s].isArrayTexture=this.textures[s].image.depth>1;this.dispose()}this.viewport.set(0,0,t,e),this.scissor.set(0,0,t,e)}clone(){return new this.constructor().copy(this)}copy(t){this.width=t.width,this.height=t.height,this.depth=t.depth,this.scissor.copy(t.scissor),this.scissorTest=t.scissorTest,this.viewport.copy(t.viewport),this.textures.length=0;for(let e=0,n=t.textures.length;e<n;e++){this.textures[e]=t.textures[e].clone(),this.textures[e].isRenderTargetTexture=!0,this.textures[e].renderTarget=this;const s=Object.assign({},t.textures[e].image);this.textures[e].source=new ol(s)}return this.depthBuffer=t.depthBuffer,this.stencilBuffer=t.stencilBuffer,this.resolveDepthBuffer=t.resolveDepthBuffer,this.resolveStencilBuffer=t.resolveStencilBuffer,t.depthTexture!==null&&(this.depthTexture=t.depthTexture.clone()),this.samples=t.samples,this}dispose(){this.dispatchEvent({type:"dispose"})}}class mi extends Hf{constructor(t=1,e=1,n={}){super(t,e,n),this.isWebGLRenderTarget=!0}}class Uh extends De{constructor(t=null,e=1,n=1,s=1){super(null),this.isDataArrayTexture=!0,this.image={data:t,width:e,height:n,depth:s},this.magFilter=tn,this.minFilter=tn,this.wrapR=ui,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1,this.layerUpdates=new Set}addLayerUpdate(t){this.layerUpdates.add(t)}clearLayerUpdates(){this.layerUpdates.clear()}}class Gf extends De{constructor(t=null,e=1,n=1,s=1){super(null),this.isData3DTexture=!0,this.image={data:t,width:e,height:n,depth:s},this.magFilter=tn,this.minFilter=tn,this.wrapR=ui,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}}class Si{constructor(t=new B(1/0,1/0,1/0),e=new B(-1/0,-1/0,-1/0)){this.isBox3=!0,this.min=t,this.max=e}set(t,e){return this.min.copy(t),this.max.copy(e),this}setFromArray(t){this.makeEmpty();for(let e=0,n=t.length;e<n;e+=3)this.expandByPoint(cn.fromArray(t,e));return this}setFromBufferAttribute(t){this.makeEmpty();for(let e=0,n=t.count;e<n;e++)this.expandByPoint(cn.fromBufferAttribute(t,e));return this}setFromPoints(t){this.makeEmpty();for(let e=0,n=t.length;e<n;e++)this.expandByPoint(t[e]);return this}setFromCenterAndSize(t,e){const n=cn.copy(e).multiplyScalar(.5);return this.min.copy(t).sub(n),this.max.copy(t).add(n),this}setFromObject(t,e=!1){return this.makeEmpty(),this.expandByObject(t,e)}clone(){return new this.constructor().copy(this)}copy(t){return this.min.copy(t.min),this.max.copy(t.max),this}makeEmpty(){return this.min.x=this.min.y=this.min.z=1/0,this.max.x=this.max.y=this.max.z=-1/0,this}isEmpty(){return this.max.x<this.min.x||this.max.y<this.min.y||this.max.z<this.min.z}getCenter(t){return this.isEmpty()?t.set(0,0,0):t.addVectors(this.min,this.max).multiplyScalar(.5)}getSize(t){return this.isEmpty()?t.set(0,0,0):t.subVectors(this.max,this.min)}expandByPoint(t){return this.min.min(t),this.max.max(t),this}expandByVector(t){return this.min.sub(t),this.max.add(t),this}expandByScalar(t){return this.min.addScalar(-t),this.max.addScalar(t),this}expandByObject(t,e=!1){t.updateWorldMatrix(!1,!1);const n=t.geometry;if(n!==void 0){const r=n.getAttribute("position");if(e===!0&&r!==void 0&&t.isInstancedMesh!==!0)for(let a=0,o=r.count;a<o;a++)t.isMesh===!0?t.getVertexPosition(a,cn):cn.fromBufferAttribute(r,a),cn.applyMatrix4(t.matrixWorld),this.expandByPoint(cn);else t.boundingBox!==void 0?(t.boundingBox===null&&t.computeBoundingBox(),Ys.copy(t.boundingBox)):(n.boundingBox===null&&n.computeBoundingBox(),Ys.copy(n.boundingBox)),Ys.applyMatrix4(t.matrixWorld),this.union(Ys)}const s=t.children;for(let r=0,a=s.length;r<a;r++)this.expandByObject(s[r],e);return this}containsPoint(t){return t.x>=this.min.x&&t.x<=this.max.x&&t.y>=this.min.y&&t.y<=this.max.y&&t.z>=this.min.z&&t.z<=this.max.z}containsBox(t){return this.min.x<=t.min.x&&t.max.x<=this.max.x&&this.min.y<=t.min.y&&t.max.y<=this.max.y&&this.min.z<=t.min.z&&t.max.z<=this.max.z}getParameter(t,e){return e.set((t.x-this.min.x)/(this.max.x-this.min.x),(t.y-this.min.y)/(this.max.y-this.min.y),(t.z-this.min.z)/(this.max.z-this.min.z))}intersectsBox(t){return t.max.x>=this.min.x&&t.min.x<=this.max.x&&t.max.y>=this.min.y&&t.min.y<=this.max.y&&t.max.z>=this.min.z&&t.min.z<=this.max.z}intersectsSphere(t){return this.clampPoint(t.center,cn),cn.distanceToSquared(t.center)<=t.radius*t.radius}intersectsPlane(t){let e,n;return t.normal.x>0?(e=t.normal.x*this.min.x,n=t.normal.x*this.max.x):(e=t.normal.x*this.max.x,n=t.normal.x*this.min.x),t.normal.y>0?(e+=t.normal.y*this.min.y,n+=t.normal.y*this.max.y):(e+=t.normal.y*this.max.y,n+=t.normal.y*this.min.y),t.normal.z>0?(e+=t.normal.z*this.min.z,n+=t.normal.z*this.max.z):(e+=t.normal.z*this.max.z,n+=t.normal.z*this.min.z),e<=-t.constant&&n>=-t.constant}intersectsTriangle(t){if(this.isEmpty())return!1;this.getCenter(us),Js.subVectors(this.max,us),Ri.subVectors(t.a,us),wi.subVectors(t.b,us),Ei.subVectors(t.c,us),Dn.subVectors(wi,Ri),Bn.subVectors(Ei,wi),Qn.subVectors(Ri,Ei);let e=[0,-Dn.z,Dn.y,0,-Bn.z,Bn.y,0,-Qn.z,Qn.y,Dn.z,0,-Dn.x,Bn.z,0,-Bn.x,Qn.z,0,-Qn.x,-Dn.y,Dn.x,0,-Bn.y,Bn.x,0,-Qn.y,Qn.x,0];return!ma(e,Ri,wi,Ei,Js)||(e=[1,0,0,0,1,0,0,0,1],!ma(e,Ri,wi,Ei,Js))?!1:(Ks.crossVectors(Dn,Bn),e=[Ks.x,Ks.y,Ks.z],ma(e,Ri,wi,Ei,Js))}clampPoint(t,e){return e.copy(t).clamp(this.min,this.max)}distanceToPoint(t){return this.clampPoint(t,cn).distanceTo(t)}getBoundingSphere(t){return this.isEmpty()?t.makeEmpty():(this.getCenter(t.center),t.radius=this.getSize(cn).length()*.5),t}intersect(t){return this.min.max(t.min),this.max.min(t.max),this.isEmpty()&&this.makeEmpty(),this}union(t){return this.min.min(t.min),this.max.max(t.max),this}applyMatrix4(t){return this.isEmpty()?this:(wn[0].set(this.min.x,this.min.y,this.min.z).applyMatrix4(t),wn[1].set(this.min.x,this.min.y,this.max.z).applyMatrix4(t),wn[2].set(this.min.x,this.max.y,this.min.z).applyMatrix4(t),wn[3].set(this.min.x,this.max.y,this.max.z).applyMatrix4(t),wn[4].set(this.max.x,this.min.y,this.min.z).applyMatrix4(t),wn[5].set(this.max.x,this.min.y,this.max.z).applyMatrix4(t),wn[6].set(this.max.x,this.max.y,this.min.z).applyMatrix4(t),wn[7].set(this.max.x,this.max.y,this.max.z).applyMatrix4(t),this.setFromPoints(wn),this)}translate(t){return this.min.add(t),this.max.add(t),this}equals(t){return t.min.equals(this.min)&&t.max.equals(this.max)}toJSON(){return{min:this.min.toArray(),max:this.max.toArray()}}fromJSON(t){return this.min.fromArray(t.min),this.max.fromArray(t.max),this}}const wn=[new B,new B,new B,new B,new B,new B,new B,new B],cn=new B,Ys=new Si,Ri=new B,wi=new B,Ei=new B,Dn=new B,Bn=new B,Qn=new B,us=new B,Js=new B,Ks=new B,ti=new B;function ma(i,t,e,n,s){for(let r=0,a=i.length-3;r<=a;r+=3){ti.fromArray(i,r);const o=s.x*Math.abs(ti.x)+s.y*Math.abs(ti.y)+s.z*Math.abs(ti.z),l=t.dot(ti),c=e.dot(ti),u=n.dot(ti);if(Math.max(-Math.max(l,c,u),Math.min(l,c,u))>o)return!1}return!0}const Vf=new Si,ds=new B,ga=new B;class xi{constructor(t=new B,e=-1){this.isSphere=!0,this.center=t,this.radius=e}set(t,e){return this.center.copy(t),this.radius=e,this}setFromPoints(t,e){const n=this.center;e!==void 0?n.copy(e):Vf.setFromPoints(t).getCenter(n);let s=0;for(let r=0,a=t.length;r<a;r++)s=Math.max(s,n.distanceToSquared(t[r]));return this.radius=Math.sqrt(s),this}copy(t){return this.center.copy(t.center),this.radius=t.radius,this}isEmpty(){return this.radius<0}makeEmpty(){return this.center.set(0,0,0),this.radius=-1,this}containsPoint(t){return t.distanceToSquared(this.center)<=this.radius*this.radius}distanceToPoint(t){return t.distanceTo(this.center)-this.radius}intersectsSphere(t){const e=this.radius+t.radius;return t.center.distanceToSquared(this.center)<=e*e}intersectsBox(t){return t.intersectsSphere(this)}intersectsPlane(t){return Math.abs(t.distanceToPoint(this.center))<=this.radius}clampPoint(t,e){const n=this.center.distanceToSquared(t);return e.copy(t),n>this.radius*this.radius&&(e.sub(this.center).normalize(),e.multiplyScalar(this.radius).add(this.center)),e}getBoundingBox(t){return this.isEmpty()?(t.makeEmpty(),t):(t.set(this.center,this.center),t.expandByScalar(this.radius),t)}applyMatrix4(t){return this.center.applyMatrix4(t),this.radius=this.radius*t.getMaxScaleOnAxis(),this}translate(t){return this.center.add(t),this}expandByPoint(t){if(this.isEmpty())return this.center.copy(t),this.radius=0,this;ds.subVectors(t,this.center);const e=ds.lengthSq();if(e>this.radius*this.radius){const n=Math.sqrt(e),s=(n-this.radius)*.5;this.center.addScaledVector(ds,s/n),this.radius+=s}return this}union(t){return t.isEmpty()?this:this.isEmpty()?(this.copy(t),this):(this.center.equals(t.center)===!0?this.radius=Math.max(this.radius,t.radius):(ga.subVectors(t.center,this.center).setLength(t.radius),this.expandByPoint(ds.copy(t.center).add(ga)),this.expandByPoint(ds.copy(t.center).sub(ga))),this)}equals(t){return t.center.equals(this.center)&&t.radius===this.radius}clone(){return new this.constructor().copy(this)}toJSON(){return{radius:this.radius,center:this.center.toArray()}}fromJSON(t){return this.radius=t.radius,this.center.fromArray(t.center),this}}const En=new B,va=new B,Zs=new B,Un=new B,Sa=new B,js=new B,xa=new B;class Qr{constructor(t=new B,e=new B(0,0,-1)){this.origin=t,this.direction=e}set(t,e){return this.origin.copy(t),this.direction.copy(e),this}copy(t){return this.origin.copy(t.origin),this.direction.copy(t.direction),this}at(t,e){return e.copy(this.origin).addScaledVector(this.direction,t)}lookAt(t){return this.direction.copy(t).sub(this.origin).normalize(),this}recast(t){return this.origin.copy(this.at(t,En)),this}closestPointToPoint(t,e){e.subVectors(t,this.origin);const n=e.dot(this.direction);return n<0?e.copy(this.origin):e.copy(this.origin).addScaledVector(this.direction,n)}distanceToPoint(t){return Math.sqrt(this.distanceSqToPoint(t))}distanceSqToPoint(t){const e=En.subVectors(t,this.origin).dot(this.direction);return e<0?this.origin.distanceToSquared(t):(En.copy(this.origin).addScaledVector(this.direction,e),En.distanceToSquared(t))}distanceSqToSegment(t,e,n,s){va.copy(t).add(e).multiplyScalar(.5),Zs.copy(e).sub(t).normalize(),Un.copy(this.origin).sub(va);const r=t.distanceTo(e)*.5,a=-this.direction.dot(Zs),o=Un.dot(this.direction),l=-Un.dot(Zs),c=Un.lengthSq(),u=Math.abs(1-a*a);let h,d,f,g;if(u>0)if(h=a*l-o,d=a*o-l,g=r*u,h>=0)if(d>=-g)if(d<=g){const v=1/u;h*=v,d*=v,f=h*(h+a*d+2*o)+d*(a*h+d+2*l)+c}else d=r,h=Math.max(0,-(a*d+o)),f=-h*h+d*(d+2*l)+c;else d=-r,h=Math.max(0,-(a*d+o)),f=-h*h+d*(d+2*l)+c;else d<=-g?(h=Math.max(0,-(-a*r+o)),d=h>0?-r:Math.min(Math.max(-r,-l),r),f=-h*h+d*(d+2*l)+c):d<=g?(h=0,d=Math.min(Math.max(-r,-l),r),f=d*(d+2*l)+c):(h=Math.max(0,-(a*r+o)),d=h>0?r:Math.min(Math.max(-r,-l),r),f=-h*h+d*(d+2*l)+c);else d=a>0?-r:r,h=Math.max(0,-(a*d+o)),f=-h*h+d*(d+2*l)+c;return n&&n.copy(this.origin).addScaledVector(this.direction,h),s&&s.copy(va).addScaledVector(Zs,d),f}intersectSphere(t,e){En.subVectors(t.center,this.origin);const n=En.dot(this.direction),s=En.dot(En)-n*n,r=t.radius*t.radius;if(s>r)return null;const a=Math.sqrt(r-s),o=n-a,l=n+a;return l<0?null:o<0?this.at(l,e):this.at(o,e)}intersectsSphere(t){return t.radius<0?!1:this.distanceSqToPoint(t.center)<=t.radius*t.radius}distanceToPlane(t){const e=t.normal.dot(this.direction);if(e===0)return t.distanceToPoint(this.origin)===0?0:null;const n=-(this.origin.dot(t.normal)+t.constant)/e;return n>=0?n:null}intersectPlane(t,e){const n=this.distanceToPlane(t);return n===null?null:this.at(n,e)}intersectsPlane(t){const e=t.distanceToPoint(this.origin);return e===0||t.normal.dot(this.direction)*e<0}intersectBox(t,e){let n,s,r,a,o,l;const c=1/this.direction.x,u=1/this.direction.y,h=1/this.direction.z,d=this.origin;return c>=0?(n=(t.min.x-d.x)*c,s=(t.max.x-d.x)*c):(n=(t.max.x-d.x)*c,s=(t.min.x-d.x)*c),u>=0?(r=(t.min.y-d.y)*u,a=(t.max.y-d.y)*u):(r=(t.max.y-d.y)*u,a=(t.min.y-d.y)*u),n>a||r>s||((r>n||isNaN(n))&&(n=r),(a<s||isNaN(s))&&(s=a),h>=0?(o=(t.min.z-d.z)*h,l=(t.max.z-d.z)*h):(o=(t.max.z-d.z)*h,l=(t.min.z-d.z)*h),n>l||o>s)||((o>n||n!==n)&&(n=o),(l<s||s!==s)&&(s=l),s<0)?null:this.at(n>=0?n:s,e)}intersectsBox(t){return this.intersectBox(t,En)!==null}intersectTriangle(t,e,n,s,r){Sa.subVectors(e,t),js.subVectors(n,t),xa.crossVectors(Sa,js);let a=this.direction.dot(xa),o;if(a>0){if(s)return null;o=1}else if(a<0)o=-1,a=-a;else return null;Un.subVectors(this.origin,t);const l=o*this.direction.dot(js.crossVectors(Un,js));if(l<0)return null;const c=o*this.direction.dot(Sa.cross(Un));if(c<0||l+c>a)return null;const u=-o*Un.dot(xa);return u<0?null:this.at(u/a,r)}applyMatrix4(t){return this.origin.applyMatrix4(t),this.direction.transformDirection(t),this}equals(t){return t.origin.equals(this.origin)&&t.direction.equals(this.direction)}clone(){return new this.constructor().copy(this)}}class se{constructor(t,e,n,s,r,a,o,l,c,u,h,d,f,g,v,m){se.prototype.isMatrix4=!0,this.elements=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],t!==void 0&&this.set(t,e,n,s,r,a,o,l,c,u,h,d,f,g,v,m)}set(t,e,n,s,r,a,o,l,c,u,h,d,f,g,v,m){const p=this.elements;return p[0]=t,p[4]=e,p[8]=n,p[12]=s,p[1]=r,p[5]=a,p[9]=o,p[13]=l,p[2]=c,p[6]=u,p[10]=h,p[14]=d,p[3]=f,p[7]=g,p[11]=v,p[15]=m,this}identity(){return this.set(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1),this}clone(){return new se().fromArray(this.elements)}copy(t){const e=this.elements,n=t.elements;return e[0]=n[0],e[1]=n[1],e[2]=n[2],e[3]=n[3],e[4]=n[4],e[5]=n[5],e[6]=n[6],e[7]=n[7],e[8]=n[8],e[9]=n[9],e[10]=n[10],e[11]=n[11],e[12]=n[12],e[13]=n[13],e[14]=n[14],e[15]=n[15],this}copyPosition(t){const e=this.elements,n=t.elements;return e[12]=n[12],e[13]=n[13],e[14]=n[14],this}setFromMatrix3(t){const e=t.elements;return this.set(e[0],e[3],e[6],0,e[1],e[4],e[7],0,e[2],e[5],e[8],0,0,0,0,1),this}extractBasis(t,e,n){return t.setFromMatrixColumn(this,0),e.setFromMatrixColumn(this,1),n.setFromMatrixColumn(this,2),this}makeBasis(t,e,n){return this.set(t.x,e.x,n.x,0,t.y,e.y,n.y,0,t.z,e.z,n.z,0,0,0,0,1),this}extractRotation(t){const e=this.elements,n=t.elements,s=1/Ti.setFromMatrixColumn(t,0).length(),r=1/Ti.setFromMatrixColumn(t,1).length(),a=1/Ti.setFromMatrixColumn(t,2).length();return e[0]=n[0]*s,e[1]=n[1]*s,e[2]=n[2]*s,e[3]=0,e[4]=n[4]*r,e[5]=n[5]*r,e[6]=n[6]*r,e[7]=0,e[8]=n[8]*a,e[9]=n[9]*a,e[10]=n[10]*a,e[11]=0,e[12]=0,e[13]=0,e[14]=0,e[15]=1,this}makeRotationFromEuler(t){const e=this.elements,n=t.x,s=t.y,r=t.z,a=Math.cos(n),o=Math.sin(n),l=Math.cos(s),c=Math.sin(s),u=Math.cos(r),h=Math.sin(r);if(t.order==="XYZ"){const d=a*u,f=a*h,g=o*u,v=o*h;e[0]=l*u,e[4]=-l*h,e[8]=c,e[1]=f+g*c,e[5]=d-v*c,e[9]=-o*l,e[2]=v-d*c,e[6]=g+f*c,e[10]=a*l}else if(t.order==="YXZ"){const d=l*u,f=l*h,g=c*u,v=c*h;e[0]=d+v*o,e[4]=g*o-f,e[8]=a*c,e[1]=a*h,e[5]=a*u,e[9]=-o,e[2]=f*o-g,e[6]=v+d*o,e[10]=a*l}else if(t.order==="ZXY"){const d=l*u,f=l*h,g=c*u,v=c*h;e[0]=d-v*o,e[4]=-a*h,e[8]=g+f*o,e[1]=f+g*o,e[5]=a*u,e[9]=v-d*o,e[2]=-a*c,e[6]=o,e[10]=a*l}else if(t.order==="ZYX"){const d=a*u,f=a*h,g=o*u,v=o*h;e[0]=l*u,e[4]=g*c-f,e[8]=d*c+v,e[1]=l*h,e[5]=v*c+d,e[9]=f*c-g,e[2]=-c,e[6]=o*l,e[10]=a*l}else if(t.order==="YZX"){const d=a*l,f=a*c,g=o*l,v=o*c;e[0]=l*u,e[4]=v-d*h,e[8]=g*h+f,e[1]=h,e[5]=a*u,e[9]=-o*u,e[2]=-c*u,e[6]=f*h+g,e[10]=d-v*h}else if(t.order==="XZY"){const d=a*l,f=a*c,g=o*l,v=o*c;e[0]=l*u,e[4]=-h,e[8]=c*u,e[1]=d*h+v,e[5]=a*u,e[9]=f*h-g,e[2]=g*h-f,e[6]=o*u,e[10]=v*h+d}return e[3]=0,e[7]=0,e[11]=0,e[12]=0,e[13]=0,e[14]=0,e[15]=1,this}makeRotationFromQuaternion(t){return this.compose(Wf,t,$f)}lookAt(t,e,n){const s=this.elements;return qe.subVectors(t,e),qe.lengthSq()===0&&(qe.z=1),qe.normalize(),Nn.crossVectors(n,qe),Nn.lengthSq()===0&&(Math.abs(n.z)===1?qe.x+=1e-4:qe.z+=1e-4,qe.normalize(),Nn.crossVectors(n,qe)),Nn.normalize(),Qs.crossVectors(qe,Nn),s[0]=Nn.x,s[4]=Qs.x,s[8]=qe.x,s[1]=Nn.y,s[5]=Qs.y,s[9]=qe.y,s[2]=Nn.z,s[6]=Qs.z,s[10]=qe.z,this}multiply(t){return this.multiplyMatrices(this,t)}premultiply(t){return this.multiplyMatrices(t,this)}multiplyMatrices(t,e){const n=t.elements,s=e.elements,r=this.elements,a=n[0],o=n[4],l=n[8],c=n[12],u=n[1],h=n[5],d=n[9],f=n[13],g=n[2],v=n[6],m=n[10],p=n[14],M=n[3],b=n[7],x=n[11],E=n[15],T=s[0],C=s[4],A=s[8],_=s[12],y=s[1],L=s[5],U=s[9],z=s[13],$=s[2],X=s[6],q=s[10],Z=s[14],W=s[3],rt=s[7],ut=s[11],Et=s[15];return r[0]=a*T+o*y+l*$+c*W,r[4]=a*C+o*L+l*X+c*rt,r[8]=a*A+o*U+l*q+c*ut,r[12]=a*_+o*z+l*Z+c*Et,r[1]=u*T+h*y+d*$+f*W,r[5]=u*C+h*L+d*X+f*rt,r[9]=u*A+h*U+d*q+f*ut,r[13]=u*_+h*z+d*Z+f*Et,r[2]=g*T+v*y+m*$+p*W,r[6]=g*C+v*L+m*X+p*rt,r[10]=g*A+v*U+m*q+p*ut,r[14]=g*_+v*z+m*Z+p*Et,r[3]=M*T+b*y+x*$+E*W,r[7]=M*C+b*L+x*X+E*rt,r[11]=M*A+b*U+x*q+E*ut,r[15]=M*_+b*z+x*Z+E*Et,this}multiplyScalar(t){const e=this.elements;return e[0]*=t,e[4]*=t,e[8]*=t,e[12]*=t,e[1]*=t,e[5]*=t,e[9]*=t,e[13]*=t,e[2]*=t,e[6]*=t,e[10]*=t,e[14]*=t,e[3]*=t,e[7]*=t,e[11]*=t,e[15]*=t,this}determinant(){const t=this.elements,e=t[0],n=t[4],s=t[8],r=t[12],a=t[1],o=t[5],l=t[9],c=t[13],u=t[2],h=t[6],d=t[10],f=t[14],g=t[3],v=t[7],m=t[11],p=t[15];return g*(+r*l*h-s*c*h-r*o*d+n*c*d+s*o*f-n*l*f)+v*(+e*l*f-e*c*d+r*a*d-s*a*f+s*c*u-r*l*u)+m*(+e*c*h-e*o*f-r*a*h+n*a*f+r*o*u-n*c*u)+p*(-s*o*u-e*l*h+e*o*d+s*a*h-n*a*d+n*l*u)}transpose(){const t=this.elements;let e;return e=t[1],t[1]=t[4],t[4]=e,e=t[2],t[2]=t[8],t[8]=e,e=t[6],t[6]=t[9],t[9]=e,e=t[3],t[3]=t[12],t[12]=e,e=t[7],t[7]=t[13],t[13]=e,e=t[11],t[11]=t[14],t[14]=e,this}setPosition(t,e,n){const s=this.elements;return t.isVector3?(s[12]=t.x,s[13]=t.y,s[14]=t.z):(s[12]=t,s[13]=e,s[14]=n),this}invert(){const t=this.elements,e=t[0],n=t[1],s=t[2],r=t[3],a=t[4],o=t[5],l=t[6],c=t[7],u=t[8],h=t[9],d=t[10],f=t[11],g=t[12],v=t[13],m=t[14],p=t[15],M=h*m*c-v*d*c+v*l*f-o*m*f-h*l*p+o*d*p,b=g*d*c-u*m*c-g*l*f+a*m*f+u*l*p-a*d*p,x=u*v*c-g*h*c+g*o*f-a*v*f-u*o*p+a*h*p,E=g*h*l-u*v*l-g*o*d+a*v*d+u*o*m-a*h*m,T=e*M+n*b+s*x+r*E;if(T===0)return this.set(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);const C=1/T;return t[0]=M*C,t[1]=(v*d*r-h*m*r-v*s*f+n*m*f+h*s*p-n*d*p)*C,t[2]=(o*m*r-v*l*r+v*s*c-n*m*c-o*s*p+n*l*p)*C,t[3]=(h*l*r-o*d*r-h*s*c+n*d*c+o*s*f-n*l*f)*C,t[4]=b*C,t[5]=(u*m*r-g*d*r+g*s*f-e*m*f-u*s*p+e*d*p)*C,t[6]=(g*l*r-a*m*r-g*s*c+e*m*c+a*s*p-e*l*p)*C,t[7]=(a*d*r-u*l*r+u*s*c-e*d*c-a*s*f+e*l*f)*C,t[8]=x*C,t[9]=(g*h*r-u*v*r-g*n*f+e*v*f+u*n*p-e*h*p)*C,t[10]=(a*v*r-g*o*r+g*n*c-e*v*c-a*n*p+e*o*p)*C,t[11]=(u*o*r-a*h*r-u*n*c+e*h*c+a*n*f-e*o*f)*C,t[12]=E*C,t[13]=(u*v*s-g*h*s+g*n*d-e*v*d-u*n*m+e*h*m)*C,t[14]=(g*o*s-a*v*s-g*n*l+e*v*l+a*n*m-e*o*m)*C,t[15]=(a*h*s-u*o*s+u*n*l-e*h*l-a*n*d+e*o*d)*C,this}scale(t){const e=this.elements,n=t.x,s=t.y,r=t.z;return e[0]*=n,e[4]*=s,e[8]*=r,e[1]*=n,e[5]*=s,e[9]*=r,e[2]*=n,e[6]*=s,e[10]*=r,e[3]*=n,e[7]*=s,e[11]*=r,this}getMaxScaleOnAxis(){const t=this.elements,e=t[0]*t[0]+t[1]*t[1]+t[2]*t[2],n=t[4]*t[4]+t[5]*t[5]+t[6]*t[6],s=t[8]*t[8]+t[9]*t[9]+t[10]*t[10];return Math.sqrt(Math.max(e,n,s))}makeTranslation(t,e,n){return t.isVector3?this.set(1,0,0,t.x,0,1,0,t.y,0,0,1,t.z,0,0,0,1):this.set(1,0,0,t,0,1,0,e,0,0,1,n,0,0,0,1),this}makeRotationX(t){const e=Math.cos(t),n=Math.sin(t);return this.set(1,0,0,0,0,e,-n,0,0,n,e,0,0,0,0,1),this}makeRotationY(t){const e=Math.cos(t),n=Math.sin(t);return this.set(e,0,n,0,0,1,0,0,-n,0,e,0,0,0,0,1),this}makeRotationZ(t){const e=Math.cos(t),n=Math.sin(t);return this.set(e,-n,0,0,n,e,0,0,0,0,1,0,0,0,0,1),this}makeRotationAxis(t,e){const n=Math.cos(e),s=Math.sin(e),r=1-n,a=t.x,o=t.y,l=t.z,c=r*a,u=r*o;return this.set(c*a+n,c*o-s*l,c*l+s*o,0,c*o+s*l,u*o+n,u*l-s*a,0,c*l-s*o,u*l+s*a,r*l*l+n,0,0,0,0,1),this}makeScale(t,e,n){return this.set(t,0,0,0,0,e,0,0,0,0,n,0,0,0,0,1),this}makeShear(t,e,n,s,r,a){return this.set(1,n,r,0,t,1,a,0,e,s,1,0,0,0,0,1),this}compose(t,e,n){const s=this.elements,r=e._x,a=e._y,o=e._z,l=e._w,c=r+r,u=a+a,h=o+o,d=r*c,f=r*u,g=r*h,v=a*u,m=a*h,p=o*h,M=l*c,b=l*u,x=l*h,E=n.x,T=n.y,C=n.z;return s[0]=(1-(v+p))*E,s[1]=(f+x)*E,s[2]=(g-b)*E,s[3]=0,s[4]=(f-x)*T,s[5]=(1-(d+p))*T,s[6]=(m+M)*T,s[7]=0,s[8]=(g+b)*C,s[9]=(m-M)*C,s[10]=(1-(d+v))*C,s[11]=0,s[12]=t.x,s[13]=t.y,s[14]=t.z,s[15]=1,this}decompose(t,e,n){const s=this.elements;let r=Ti.set(s[0],s[1],s[2]).length();const a=Ti.set(s[4],s[5],s[6]).length(),o=Ti.set(s[8],s[9],s[10]).length();this.determinant()<0&&(r=-r),t.x=s[12],t.y=s[13],t.z=s[14],hn.copy(this);const c=1/r,u=1/a,h=1/o;return hn.elements[0]*=c,hn.elements[1]*=c,hn.elements[2]*=c,hn.elements[4]*=u,hn.elements[5]*=u,hn.elements[6]*=u,hn.elements[8]*=h,hn.elements[9]*=h,hn.elements[10]*=h,e.setFromRotationMatrix(hn),n.x=r,n.y=a,n.z=o,this}makePerspective(t,e,n,s,r,a,o=Sn,l=!1){const c=this.elements,u=2*r/(e-t),h=2*r/(n-s),d=(e+t)/(e-t),f=(n+s)/(n-s);let g,v;if(l)g=r/(a-r),v=a*r/(a-r);else if(o===Sn)g=-(a+r)/(a-r),v=-2*a*r/(a-r);else if(o===Xr)g=-a/(a-r),v=-a*r/(a-r);else throw new Error("THREE.Matrix4.makePerspective(): Invalid coordinate system: "+o);return c[0]=u,c[4]=0,c[8]=d,c[12]=0,c[1]=0,c[5]=h,c[9]=f,c[13]=0,c[2]=0,c[6]=0,c[10]=g,c[14]=v,c[3]=0,c[7]=0,c[11]=-1,c[15]=0,this}makeOrthographic(t,e,n,s,r,a,o=Sn,l=!1){const c=this.elements,u=2/(e-t),h=2/(n-s),d=-(e+t)/(e-t),f=-(n+s)/(n-s);let g,v;if(l)g=1/(a-r),v=a/(a-r);else if(o===Sn)g=-2/(a-r),v=-(a+r)/(a-r);else if(o===Xr)g=-1/(a-r),v=-r/(a-r);else throw new Error("THREE.Matrix4.makeOrthographic(): Invalid coordinate system: "+o);return c[0]=u,c[4]=0,c[8]=0,c[12]=d,c[1]=0,c[5]=h,c[9]=0,c[13]=f,c[2]=0,c[6]=0,c[10]=g,c[14]=v,c[3]=0,c[7]=0,c[11]=0,c[15]=1,this}equals(t){const e=this.elements,n=t.elements;for(let s=0;s<16;s++)if(e[s]!==n[s])return!1;return!0}fromArray(t,e=0){for(let n=0;n<16;n++)this.elements[n]=t[n+e];return this}toArray(t=[],e=0){const n=this.elements;return t[e]=n[0],t[e+1]=n[1],t[e+2]=n[2],t[e+3]=n[3],t[e+4]=n[4],t[e+5]=n[5],t[e+6]=n[6],t[e+7]=n[7],t[e+8]=n[8],t[e+9]=n[9],t[e+10]=n[10],t[e+11]=n[11],t[e+12]=n[12],t[e+13]=n[13],t[e+14]=n[14],t[e+15]=n[15],t}}const Ti=new B,hn=new se,Wf=new B(0,0,0),$f=new B(1,1,1),Nn=new B,Qs=new B,qe=new B,$l=new se,Xl=new Vs;class Mn{constructor(t=0,e=0,n=0,s=Mn.DEFAULT_ORDER){this.isEuler=!0,this._x=t,this._y=e,this._z=n,this._order=s}get x(){return this._x}set x(t){this._x=t,this._onChangeCallback()}get y(){return this._y}set y(t){this._y=t,this._onChangeCallback()}get z(){return this._z}set z(t){this._z=t,this._onChangeCallback()}get order(){return this._order}set order(t){this._order=t,this._onChangeCallback()}set(t,e,n,s=this._order){return this._x=t,this._y=e,this._z=n,this._order=s,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._order)}copy(t){return this._x=t._x,this._y=t._y,this._z=t._z,this._order=t._order,this._onChangeCallback(),this}setFromRotationMatrix(t,e=this._order,n=!0){const s=t.elements,r=s[0],a=s[4],o=s[8],l=s[1],c=s[5],u=s[9],h=s[2],d=s[6],f=s[10];switch(e){case"XYZ":this._y=Math.asin(Wt(o,-1,1)),Math.abs(o)<.9999999?(this._x=Math.atan2(-u,f),this._z=Math.atan2(-a,r)):(this._x=Math.atan2(d,c),this._z=0);break;case"YXZ":this._x=Math.asin(-Wt(u,-1,1)),Math.abs(u)<.9999999?(this._y=Math.atan2(o,f),this._z=Math.atan2(l,c)):(this._y=Math.atan2(-h,r),this._z=0);break;case"ZXY":this._x=Math.asin(Wt(d,-1,1)),Math.abs(d)<.9999999?(this._y=Math.atan2(-h,f),this._z=Math.atan2(-a,c)):(this._y=0,this._z=Math.atan2(l,r));break;case"ZYX":this._y=Math.asin(-Wt(h,-1,1)),Math.abs(h)<.9999999?(this._x=Math.atan2(d,f),this._z=Math.atan2(l,r)):(this._x=0,this._z=Math.atan2(-a,c));break;case"YZX":this._z=Math.asin(Wt(l,-1,1)),Math.abs(l)<.9999999?(this._x=Math.atan2(-u,c),this._y=Math.atan2(-h,r)):(this._x=0,this._y=Math.atan2(o,f));break;case"XZY":this._z=Math.asin(-Wt(a,-1,1)),Math.abs(a)<.9999999?(this._x=Math.atan2(d,c),this._y=Math.atan2(o,r)):(this._x=Math.atan2(-u,f),this._y=0);break;default:console.warn("THREE.Euler: .setFromRotationMatrix() encountered an unknown order: "+e)}return this._order=e,n===!0&&this._onChangeCallback(),this}setFromQuaternion(t,e,n){return $l.makeRotationFromQuaternion(t),this.setFromRotationMatrix($l,e,n)}setFromVector3(t,e=this._order){return this.set(t.x,t.y,t.z,e)}reorder(t){return Xl.setFromEuler(this),this.setFromQuaternion(Xl,t)}equals(t){return t._x===this._x&&t._y===this._y&&t._z===this._z&&t._order===this._order}fromArray(t){return this._x=t[0],this._y=t[1],this._z=t[2],t[3]!==void 0&&(this._order=t[3]),this._onChangeCallback(),this}toArray(t=[],e=0){return t[e]=this._x,t[e+1]=this._y,t[e+2]=this._z,t[e+3]=this._order,t}_onChange(t){return this._onChangeCallback=t,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._order}}Mn.DEFAULT_ORDER="XYZ";class ll{constructor(){this.mask=1}set(t){this.mask=(1<<t|0)>>>0}enable(t){this.mask|=1<<t|0}enableAll(){this.mask=-1}toggle(t){this.mask^=1<<t|0}disable(t){this.mask&=~(1<<t|0)}disableAll(){this.mask=0}test(t){return(this.mask&t.mask)!==0}isEnabled(t){return(this.mask&(1<<t|0))!==0}}let Xf=0;const ql=new B,Ci=new Vs,Tn=new se,tr=new B,fs=new B,qf=new B,Yf=new Vs,Yl=new B(1,0,0),Jl=new B(0,1,0),Kl=new B(0,0,1),Zl={type:"added"},Jf={type:"removed"},Ai={type:"childadded",child:null},_a={type:"childremoved",child:null};class Se extends rs{constructor(){super(),this.isObject3D=!0,Object.defineProperty(this,"id",{value:Xf++}),this.uuid=Fn(),this.name="",this.type="Object3D",this.parent=null,this.children=[],this.up=Se.DEFAULT_UP.clone();const t=new B,e=new Mn,n=new Vs,s=new B(1,1,1);function r(){n.setFromEuler(e,!1)}function a(){e.setFromQuaternion(n,void 0,!1)}e._onChange(r),n._onChange(a),Object.defineProperties(this,{position:{configurable:!0,enumerable:!0,value:t},rotation:{configurable:!0,enumerable:!0,value:e},quaternion:{configurable:!0,enumerable:!0,value:n},scale:{configurable:!0,enumerable:!0,value:s},modelViewMatrix:{value:new se},normalMatrix:{value:new zt}}),this.matrix=new se,this.matrixWorld=new se,this.matrixAutoUpdate=Se.DEFAULT_MATRIX_AUTO_UPDATE,this.matrixWorldAutoUpdate=Se.DEFAULT_MATRIX_WORLD_AUTO_UPDATE,this.matrixWorldNeedsUpdate=!1,this.layers=new ll,this.visible=!0,this.castShadow=!1,this.receiveShadow=!1,this.frustumCulled=!0,this.renderOrder=0,this.animations=[],this.customDepthMaterial=void 0,this.customDistanceMaterial=void 0,this.userData={}}onBeforeShadow(){}onAfterShadow(){}onBeforeRender(){}onAfterRender(){}applyMatrix4(t){this.matrixAutoUpdate&&this.updateMatrix(),this.matrix.premultiply(t),this.matrix.decompose(this.position,this.quaternion,this.scale)}applyQuaternion(t){return this.quaternion.premultiply(t),this}setRotationFromAxisAngle(t,e){this.quaternion.setFromAxisAngle(t,e)}setRotationFromEuler(t){this.quaternion.setFromEuler(t,!0)}setRotationFromMatrix(t){this.quaternion.setFromRotationMatrix(t)}setRotationFromQuaternion(t){this.quaternion.copy(t)}rotateOnAxis(t,e){return Ci.setFromAxisAngle(t,e),this.quaternion.multiply(Ci),this}rotateOnWorldAxis(t,e){return Ci.setFromAxisAngle(t,e),this.quaternion.premultiply(Ci),this}rotateX(t){return this.rotateOnAxis(Yl,t)}rotateY(t){return this.rotateOnAxis(Jl,t)}rotateZ(t){return this.rotateOnAxis(Kl,t)}translateOnAxis(t,e){return ql.copy(t).applyQuaternion(this.quaternion),this.position.add(ql.multiplyScalar(e)),this}translateX(t){return this.translateOnAxis(Yl,t)}translateY(t){return this.translateOnAxis(Jl,t)}translateZ(t){return this.translateOnAxis(Kl,t)}localToWorld(t){return this.updateWorldMatrix(!0,!1),t.applyMatrix4(this.matrixWorld)}worldToLocal(t){return this.updateWorldMatrix(!0,!1),t.applyMatrix4(Tn.copy(this.matrixWorld).invert())}lookAt(t,e,n){t.isVector3?tr.copy(t):tr.set(t,e,n);const s=this.parent;this.updateWorldMatrix(!0,!1),fs.setFromMatrixPosition(this.matrixWorld),this.isCamera||this.isLight?Tn.lookAt(fs,tr,this.up):Tn.lookAt(tr,fs,this.up),this.quaternion.setFromRotationMatrix(Tn),s&&(Tn.extractRotation(s.matrixWorld),Ci.setFromRotationMatrix(Tn),this.quaternion.premultiply(Ci.invert()))}add(t){if(arguments.length>1){for(let e=0;e<arguments.length;e++)this.add(arguments[e]);return this}return t===this?(console.error("THREE.Object3D.add: object can't be added as a child of itself.",t),this):(t&&t.isObject3D?(t.removeFromParent(),t.parent=this,this.children.push(t),t.dispatchEvent(Zl),Ai.child=t,this.dispatchEvent(Ai),Ai.child=null):console.error("THREE.Object3D.add: object not an instance of THREE.Object3D.",t),this)}remove(t){if(arguments.length>1){for(let n=0;n<arguments.length;n++)this.remove(arguments[n]);return this}const e=this.children.indexOf(t);return e!==-1&&(t.parent=null,this.children.splice(e,1),t.dispatchEvent(Jf),_a.child=t,this.dispatchEvent(_a),_a.child=null),this}removeFromParent(){const t=this.parent;return t!==null&&t.remove(this),this}clear(){return this.remove(...this.children)}attach(t){return this.updateWorldMatrix(!0,!1),Tn.copy(this.matrixWorld).invert(),t.parent!==null&&(t.parent.updateWorldMatrix(!0,!1),Tn.multiply(t.parent.matrixWorld)),t.applyMatrix4(Tn),t.removeFromParent(),t.parent=this,this.children.push(t),t.updateWorldMatrix(!1,!0),t.dispatchEvent(Zl),Ai.child=t,this.dispatchEvent(Ai),Ai.child=null,this}getObjectById(t){return this.getObjectByProperty("id",t)}getObjectByName(t){return this.getObjectByProperty("name",t)}getObjectByProperty(t,e){if(this[t]===e)return this;for(let n=0,s=this.children.length;n<s;n++){const a=this.children[n].getObjectByProperty(t,e);if(a!==void 0)return a}}getObjectsByProperty(t,e,n=[]){this[t]===e&&n.push(this);const s=this.children;for(let r=0,a=s.length;r<a;r++)s[r].getObjectsByProperty(t,e,n);return n}getWorldPosition(t){return this.updateWorldMatrix(!0,!1),t.setFromMatrixPosition(this.matrixWorld)}getWorldQuaternion(t){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(fs,t,qf),t}getWorldScale(t){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(fs,Yf,t),t}getWorldDirection(t){this.updateWorldMatrix(!0,!1);const e=this.matrixWorld.elements;return t.set(e[8],e[9],e[10]).normalize()}raycast(){}traverse(t){t(this);const e=this.children;for(let n=0,s=e.length;n<s;n++)e[n].traverse(t)}traverseVisible(t){if(this.visible===!1)return;t(this);const e=this.children;for(let n=0,s=e.length;n<s;n++)e[n].traverseVisible(t)}traverseAncestors(t){const e=this.parent;e!==null&&(t(e),e.traverseAncestors(t))}updateMatrix(){this.matrix.compose(this.position,this.quaternion,this.scale),this.matrixWorldNeedsUpdate=!0}updateMatrixWorld(t){this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||t)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,t=!0);const e=this.children;for(let n=0,s=e.length;n<s;n++)e[n].updateMatrixWorld(t)}updateWorldMatrix(t,e){const n=this.parent;if(t===!0&&n!==null&&n.updateWorldMatrix(!0,!1),this.matrixAutoUpdate&&this.updateMatrix(),this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),e===!0){const s=this.children;for(let r=0,a=s.length;r<a;r++)s[r].updateWorldMatrix(!1,!0)}}toJSON(t){const e=t===void 0||typeof t=="string",n={};e&&(t={geometries:{},materials:{},textures:{},images:{},shapes:{},skeletons:{},animations:{},nodes:{}},n.metadata={version:4.7,type:"Object",generator:"Object3D.toJSON"});const s={};s.uuid=this.uuid,s.type=this.type,this.name!==""&&(s.name=this.name),this.castShadow===!0&&(s.castShadow=!0),this.receiveShadow===!0&&(s.receiveShadow=!0),this.visible===!1&&(s.visible=!1),this.frustumCulled===!1&&(s.frustumCulled=!1),this.renderOrder!==0&&(s.renderOrder=this.renderOrder),Object.keys(this.userData).length>0&&(s.userData=this.userData),s.layers=this.layers.mask,s.matrix=this.matrix.toArray(),s.up=this.up.toArray(),this.matrixAutoUpdate===!1&&(s.matrixAutoUpdate=!1),this.isInstancedMesh&&(s.type="InstancedMesh",s.count=this.count,s.instanceMatrix=this.instanceMatrix.toJSON(),this.instanceColor!==null&&(s.instanceColor=this.instanceColor.toJSON())),this.isBatchedMesh&&(s.type="BatchedMesh",s.perObjectFrustumCulled=this.perObjectFrustumCulled,s.sortObjects=this.sortObjects,s.drawRanges=this._drawRanges,s.reservedRanges=this._reservedRanges,s.geometryInfo=this._geometryInfo.map(o=>({...o,boundingBox:o.boundingBox?o.boundingBox.toJSON():void 0,boundingSphere:o.boundingSphere?o.boundingSphere.toJSON():void 0})),s.instanceInfo=this._instanceInfo.map(o=>({...o})),s.availableInstanceIds=this._availableInstanceIds.slice(),s.availableGeometryIds=this._availableGeometryIds.slice(),s.nextIndexStart=this._nextIndexStart,s.nextVertexStart=this._nextVertexStart,s.geometryCount=this._geometryCount,s.maxInstanceCount=this._maxInstanceCount,s.maxVertexCount=this._maxVertexCount,s.maxIndexCount=this._maxIndexCount,s.geometryInitialized=this._geometryInitialized,s.matricesTexture=this._matricesTexture.toJSON(t),s.indirectTexture=this._indirectTexture.toJSON(t),this._colorsTexture!==null&&(s.colorsTexture=this._colorsTexture.toJSON(t)),this.boundingSphere!==null&&(s.boundingSphere=this.boundingSphere.toJSON()),this.boundingBox!==null&&(s.boundingBox=this.boundingBox.toJSON()));function r(o,l){return o[l.uuid]===void 0&&(o[l.uuid]=l.toJSON(t)),l.uuid}if(this.isScene)this.background&&(this.background.isColor?s.background=this.background.toJSON():this.background.isTexture&&(s.background=this.background.toJSON(t).uuid)),this.environment&&this.environment.isTexture&&this.environment.isRenderTargetTexture!==!0&&(s.environment=this.environment.toJSON(t).uuid);else if(this.isMesh||this.isLine||this.isPoints){s.geometry=r(t.geometries,this.geometry);const o=this.geometry.parameters;if(o!==void 0&&o.shapes!==void 0){const l=o.shapes;if(Array.isArray(l))for(let c=0,u=l.length;c<u;c++){const h=l[c];r(t.shapes,h)}else r(t.shapes,l)}}if(this.isSkinnedMesh&&(s.bindMode=this.bindMode,s.bindMatrix=this.bindMatrix.toArray(),this.skeleton!==void 0&&(r(t.skeletons,this.skeleton),s.skeleton=this.skeleton.uuid)),this.material!==void 0)if(Array.isArray(this.material)){const o=[];for(let l=0,c=this.material.length;l<c;l++)o.push(r(t.materials,this.material[l]));s.material=o}else s.material=r(t.materials,this.material);if(this.children.length>0){s.children=[];for(let o=0;o<this.children.length;o++)s.children.push(this.children[o].toJSON(t).object)}if(this.animations.length>0){s.animations=[];for(let o=0;o<this.animations.length;o++){const l=this.animations[o];s.animations.push(r(t.animations,l))}}if(e){const o=a(t.geometries),l=a(t.materials),c=a(t.textures),u=a(t.images),h=a(t.shapes),d=a(t.skeletons),f=a(t.animations),g=a(t.nodes);o.length>0&&(n.geometries=o),l.length>0&&(n.materials=l),c.length>0&&(n.textures=c),u.length>0&&(n.images=u),h.length>0&&(n.shapes=h),d.length>0&&(n.skeletons=d),f.length>0&&(n.animations=f),g.length>0&&(n.nodes=g)}return n.object=s,n;function a(o){const l=[];for(const c in o){const u=o[c];delete u.metadata,l.push(u)}return l}}clone(t){return new this.constructor().copy(this,t)}copy(t,e=!0){if(this.name=t.name,this.up.copy(t.up),this.position.copy(t.position),this.rotation.order=t.rotation.order,this.quaternion.copy(t.quaternion),this.scale.copy(t.scale),this.matrix.copy(t.matrix),this.matrixWorld.copy(t.matrixWorld),this.matrixAutoUpdate=t.matrixAutoUpdate,this.matrixWorldAutoUpdate=t.matrixWorldAutoUpdate,this.matrixWorldNeedsUpdate=t.matrixWorldNeedsUpdate,this.layers.mask=t.layers.mask,this.visible=t.visible,this.castShadow=t.castShadow,this.receiveShadow=t.receiveShadow,this.frustumCulled=t.frustumCulled,this.renderOrder=t.renderOrder,this.animations=t.animations.slice(),this.userData=JSON.parse(JSON.stringify(t.userData)),e===!0)for(let n=0;n<t.children.length;n++){const s=t.children[n];this.add(s.clone())}return this}}Se.DEFAULT_UP=new B(0,1,0);Se.DEFAULT_MATRIX_AUTO_UPDATE=!0;Se.DEFAULT_MATRIX_WORLD_AUTO_UPDATE=!0;const un=new B,Cn=new B,ya=new B,An=new B,Li=new B,Pi=new B,jl=new B,Ma=new B,ba=new B,Ra=new B,wa=new me,Ea=new me,Ta=new me;class an{constructor(t=new B,e=new B,n=new B){this.a=t,this.b=e,this.c=n}static getNormal(t,e,n,s){s.subVectors(n,e),un.subVectors(t,e),s.cross(un);const r=s.lengthSq();return r>0?s.multiplyScalar(1/Math.sqrt(r)):s.set(0,0,0)}static getBarycoord(t,e,n,s,r){un.subVectors(s,e),Cn.subVectors(n,e),ya.subVectors(t,e);const a=un.dot(un),o=un.dot(Cn),l=un.dot(ya),c=Cn.dot(Cn),u=Cn.dot(ya),h=a*c-o*o;if(h===0)return r.set(0,0,0),null;const d=1/h,f=(c*l-o*u)*d,g=(a*u-o*l)*d;return r.set(1-f-g,g,f)}static containsPoint(t,e,n,s){return this.getBarycoord(t,e,n,s,An)===null?!1:An.x>=0&&An.y>=0&&An.x+An.y<=1}static getInterpolation(t,e,n,s,r,a,o,l){return this.getBarycoord(t,e,n,s,An)===null?(l.x=0,l.y=0,"z"in l&&(l.z=0),"w"in l&&(l.w=0),null):(l.setScalar(0),l.addScaledVector(r,An.x),l.addScaledVector(a,An.y),l.addScaledVector(o,An.z),l)}static getInterpolatedAttribute(t,e,n,s,r,a){return wa.setScalar(0),Ea.setScalar(0),Ta.setScalar(0),wa.fromBufferAttribute(t,e),Ea.fromBufferAttribute(t,n),Ta.fromBufferAttribute(t,s),a.setScalar(0),a.addScaledVector(wa,r.x),a.addScaledVector(Ea,r.y),a.addScaledVector(Ta,r.z),a}static isFrontFacing(t,e,n,s){return un.subVectors(n,e),Cn.subVectors(t,e),un.cross(Cn).dot(s)<0}set(t,e,n){return this.a.copy(t),this.b.copy(e),this.c.copy(n),this}setFromPointsAndIndices(t,e,n,s){return this.a.copy(t[e]),this.b.copy(t[n]),this.c.copy(t[s]),this}setFromAttributeAndIndices(t,e,n,s){return this.a.fromBufferAttribute(t,e),this.b.fromBufferAttribute(t,n),this.c.fromBufferAttribute(t,s),this}clone(){return new this.constructor().copy(this)}copy(t){return this.a.copy(t.a),this.b.copy(t.b),this.c.copy(t.c),this}getArea(){return un.subVectors(this.c,this.b),Cn.subVectors(this.a,this.b),un.cross(Cn).length()*.5}getMidpoint(t){return t.addVectors(this.a,this.b).add(this.c).multiplyScalar(1/3)}getNormal(t){return an.getNormal(this.a,this.b,this.c,t)}getPlane(t){return t.setFromCoplanarPoints(this.a,this.b,this.c)}getBarycoord(t,e){return an.getBarycoord(t,this.a,this.b,this.c,e)}getInterpolation(t,e,n,s,r){return an.getInterpolation(t,this.a,this.b,this.c,e,n,s,r)}containsPoint(t){return an.containsPoint(t,this.a,this.b,this.c)}isFrontFacing(t){return an.isFrontFacing(this.a,this.b,this.c,t)}intersectsBox(t){return t.intersectsTriangle(this)}closestPointToPoint(t,e){const n=this.a,s=this.b,r=this.c;let a,o;Li.subVectors(s,n),Pi.subVectors(r,n),Ma.subVectors(t,n);const l=Li.dot(Ma),c=Pi.dot(Ma);if(l<=0&&c<=0)return e.copy(n);ba.subVectors(t,s);const u=Li.dot(ba),h=Pi.dot(ba);if(u>=0&&h<=u)return e.copy(s);const d=l*h-u*c;if(d<=0&&l>=0&&u<=0)return a=l/(l-u),e.copy(n).addScaledVector(Li,a);Ra.subVectors(t,r);const f=Li.dot(Ra),g=Pi.dot(Ra);if(g>=0&&f<=g)return e.copy(r);const v=f*c-l*g;if(v<=0&&c>=0&&g<=0)return o=c/(c-g),e.copy(n).addScaledVector(Pi,o);const m=u*g-f*h;if(m<=0&&h-u>=0&&f-g>=0)return jl.subVectors(r,s),o=(h-u)/(h-u+(f-g)),e.copy(s).addScaledVector(jl,o);const p=1/(m+v+d);return a=v*p,o=d*p,e.copy(n).addScaledVector(Li,a).addScaledVector(Pi,o)}equals(t){return t.a.equals(this.a)&&t.b.equals(this.b)&&t.c.equals(this.c)}}const Nh={aliceblue:15792383,antiquewhite:16444375,aqua:65535,aquamarine:8388564,azure:15794175,beige:16119260,bisque:16770244,black:0,blanchedalmond:16772045,blue:255,blueviolet:9055202,brown:10824234,burlywood:14596231,cadetblue:6266528,chartreuse:8388352,chocolate:13789470,coral:16744272,cornflowerblue:6591981,cornsilk:16775388,crimson:14423100,cyan:65535,darkblue:139,darkcyan:35723,darkgoldenrod:12092939,darkgray:11119017,darkgreen:25600,darkgrey:11119017,darkkhaki:12433259,darkmagenta:9109643,darkolivegreen:5597999,darkorange:16747520,darkorchid:10040012,darkred:9109504,darksalmon:15308410,darkseagreen:9419919,darkslateblue:4734347,darkslategray:3100495,darkslategrey:3100495,darkturquoise:52945,darkviolet:9699539,deeppink:16716947,deepskyblue:49151,dimgray:6908265,dimgrey:6908265,dodgerblue:2003199,firebrick:11674146,floralwhite:16775920,forestgreen:2263842,fuchsia:16711935,gainsboro:14474460,ghostwhite:16316671,gold:16766720,goldenrod:14329120,gray:8421504,green:32768,greenyellow:11403055,grey:8421504,honeydew:15794160,hotpink:16738740,indianred:13458524,indigo:4915330,ivory:16777200,khaki:15787660,lavender:15132410,lavenderblush:16773365,lawngreen:8190976,lemonchiffon:16775885,lightblue:11393254,lightcoral:15761536,lightcyan:14745599,lightgoldenrodyellow:16448210,lightgray:13882323,lightgreen:9498256,lightgrey:13882323,lightpink:16758465,lightsalmon:16752762,lightseagreen:2142890,lightskyblue:8900346,lightslategray:7833753,lightslategrey:7833753,lightsteelblue:11584734,lightyellow:16777184,lime:65280,limegreen:3329330,linen:16445670,magenta:16711935,maroon:8388608,mediumaquamarine:6737322,mediumblue:205,mediumorchid:12211667,mediumpurple:9662683,mediumseagreen:3978097,mediumslateblue:8087790,mediumspringgreen:64154,mediumturquoise:4772300,mediumvioletred:13047173,midnightblue:1644912,mintcream:16121850,mistyrose:16770273,moccasin:16770229,navajowhite:16768685,navy:128,oldlace:16643558,olive:8421376,olivedrab:7048739,orange:16753920,orangered:16729344,orchid:14315734,palegoldenrod:15657130,palegreen:10025880,paleturquoise:11529966,palevioletred:14381203,papayawhip:16773077,peachpuff:16767673,peru:13468991,pink:16761035,plum:14524637,powderblue:11591910,purple:8388736,rebeccapurple:6697881,red:16711680,rosybrown:12357519,royalblue:4286945,saddlebrown:9127187,salmon:16416882,sandybrown:16032864,seagreen:3050327,seashell:16774638,sienna:10506797,silver:12632256,skyblue:8900331,slateblue:6970061,slategray:7372944,slategrey:7372944,snow:16775930,springgreen:65407,steelblue:4620980,tan:13808780,teal:32896,thistle:14204888,tomato:16737095,turquoise:4251856,violet:15631086,wheat:16113331,white:16777215,whitesmoke:16119285,yellow:16776960,yellowgreen:10145074},On={h:0,s:0,l:0},er={h:0,s:0,l:0};function Ca(i,t,e){return e<0&&(e+=1),e>1&&(e-=1),e<1/6?i+(t-i)*6*e:e<1/2?t:e<2/3?i+(t-i)*6*(2/3-e):i}class Nt{constructor(t,e,n){return this.isColor=!0,this.r=1,this.g=1,this.b=1,this.set(t,e,n)}set(t,e,n){if(e===void 0&&n===void 0){const s=t;s&&s.isColor?this.copy(s):typeof s=="number"?this.setHex(s):typeof s=="string"&&this.setStyle(s)}else this.setRGB(t,e,n);return this}setScalar(t){return this.r=t,this.g=t,this.b=t,this}setHex(t,e=Me){return t=Math.floor(t),this.r=(t>>16&255)/255,this.g=(t>>8&255)/255,this.b=(t&255)/255,Kt.colorSpaceToWorking(this,e),this}setRGB(t,e,n,s=Kt.workingColorSpace){return this.r=t,this.g=e,this.b=n,Kt.colorSpaceToWorking(this,s),this}setHSL(t,e,n,s=Kt.workingColorSpace){if(t=Df(t,1),e=Wt(e,0,1),n=Wt(n,0,1),e===0)this.r=this.g=this.b=n;else{const r=n<=.5?n*(1+e):n+e-n*e,a=2*n-r;this.r=Ca(a,r,t+1/3),this.g=Ca(a,r,t),this.b=Ca(a,r,t-1/3)}return Kt.colorSpaceToWorking(this,s),this}setStyle(t,e=Me){function n(r){r!==void 0&&parseFloat(r)<1&&console.warn("THREE.Color: Alpha component of "+t+" will be ignored.")}let s;if(s=/^(\w+)\(([^\)]*)\)/.exec(t)){let r;const a=s[1],o=s[2];switch(a){case"rgb":case"rgba":if(r=/^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return n(r[4]),this.setRGB(Math.min(255,parseInt(r[1],10))/255,Math.min(255,parseInt(r[2],10))/255,Math.min(255,parseInt(r[3],10))/255,e);if(r=/^\s*(\d+)\%\s*,\s*(\d+)\%\s*,\s*(\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return n(r[4]),this.setRGB(Math.min(100,parseInt(r[1],10))/100,Math.min(100,parseInt(r[2],10))/100,Math.min(100,parseInt(r[3],10))/100,e);break;case"hsl":case"hsla":if(r=/^\s*(\d*\.?\d+)\s*,\s*(\d*\.?\d+)\%\s*,\s*(\d*\.?\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return n(r[4]),this.setHSL(parseFloat(r[1])/360,parseFloat(r[2])/100,parseFloat(r[3])/100,e);break;default:console.warn("THREE.Color: Unknown color model "+t)}}else if(s=/^\#([A-Fa-f\d]+)$/.exec(t)){const r=s[1],a=r.length;if(a===3)return this.setRGB(parseInt(r.charAt(0),16)/15,parseInt(r.charAt(1),16)/15,parseInt(r.charAt(2),16)/15,e);if(a===6)return this.setHex(parseInt(r,16),e);console.warn("THREE.Color: Invalid hex color "+t)}else if(t&&t.length>0)return this.setColorName(t,e);return this}setColorName(t,e=Me){const n=Nh[t.toLowerCase()];return n!==void 0?this.setHex(n,e):console.warn("THREE.Color: Unknown color "+t),this}clone(){return new this.constructor(this.r,this.g,this.b)}copy(t){return this.r=t.r,this.g=t.g,this.b=t.b,this}copySRGBToLinear(t){return this.r=In(t.r),this.g=In(t.g),this.b=In(t.b),this}copyLinearToSRGB(t){return this.r=Xi(t.r),this.g=Xi(t.g),this.b=Xi(t.b),this}convertSRGBToLinear(){return this.copySRGBToLinear(this),this}convertLinearToSRGB(){return this.copyLinearToSRGB(this),this}getHex(t=Me){return Kt.workingToColorSpace(Ae.copy(this),t),Math.round(Wt(Ae.r*255,0,255))*65536+Math.round(Wt(Ae.g*255,0,255))*256+Math.round(Wt(Ae.b*255,0,255))}getHexString(t=Me){return("000000"+this.getHex(t).toString(16)).slice(-6)}getHSL(t,e=Kt.workingColorSpace){Kt.workingToColorSpace(Ae.copy(this),e);const n=Ae.r,s=Ae.g,r=Ae.b,a=Math.max(n,s,r),o=Math.min(n,s,r);let l,c;const u=(o+a)/2;if(o===a)l=0,c=0;else{const h=a-o;switch(c=u<=.5?h/(a+o):h/(2-a-o),a){case n:l=(s-r)/h+(s<r?6:0);break;case s:l=(r-n)/h+2;break;case r:l=(n-s)/h+4;break}l/=6}return t.h=l,t.s=c,t.l=u,t}getRGB(t,e=Kt.workingColorSpace){return Kt.workingToColorSpace(Ae.copy(this),e),t.r=Ae.r,t.g=Ae.g,t.b=Ae.b,t}getStyle(t=Me){Kt.workingToColorSpace(Ae.copy(this),t);const e=Ae.r,n=Ae.g,s=Ae.b;return t!==Me?`color(${t} ${e.toFixed(3)} ${n.toFixed(3)} ${s.toFixed(3)})`:`rgb(${Math.round(e*255)},${Math.round(n*255)},${Math.round(s*255)})`}offsetHSL(t,e,n){return this.getHSL(On),this.setHSL(On.h+t,On.s+e,On.l+n)}add(t){return this.r+=t.r,this.g+=t.g,this.b+=t.b,this}addColors(t,e){return this.r=t.r+e.r,this.g=t.g+e.g,this.b=t.b+e.b,this}addScalar(t){return this.r+=t,this.g+=t,this.b+=t,this}sub(t){return this.r=Math.max(0,this.r-t.r),this.g=Math.max(0,this.g-t.g),this.b=Math.max(0,this.b-t.b),this}multiply(t){return this.r*=t.r,this.g*=t.g,this.b*=t.b,this}multiplyScalar(t){return this.r*=t,this.g*=t,this.b*=t,this}lerp(t,e){return this.r+=(t.r-this.r)*e,this.g+=(t.g-this.g)*e,this.b+=(t.b-this.b)*e,this}lerpColors(t,e,n){return this.r=t.r+(e.r-t.r)*n,this.g=t.g+(e.g-t.g)*n,this.b=t.b+(e.b-t.b)*n,this}lerpHSL(t,e){this.getHSL(On),t.getHSL(er);const n=ha(On.h,er.h,e),s=ha(On.s,er.s,e),r=ha(On.l,er.l,e);return this.setHSL(n,s,r),this}setFromVector3(t){return this.r=t.x,this.g=t.y,this.b=t.z,this}applyMatrix3(t){const e=this.r,n=this.g,s=this.b,r=t.elements;return this.r=r[0]*e+r[3]*n+r[6]*s,this.g=r[1]*e+r[4]*n+r[7]*s,this.b=r[2]*e+r[5]*n+r[8]*s,this}equals(t){return t.r===this.r&&t.g===this.g&&t.b===this.b}fromArray(t,e=0){return this.r=t[e],this.g=t[e+1],this.b=t[e+2],this}toArray(t=[],e=0){return t[e]=this.r,t[e+1]=this.g,t[e+2]=this.b,t}fromBufferAttribute(t,e){return this.r=t.getX(e),this.g=t.getY(e),this.b=t.getZ(e),this}toJSON(){return this.getHex()}*[Symbol.iterator](){yield this.r,yield this.g,yield this.b}}const Ae=new Nt;Nt.NAMES=Nh;let Kf=0;class Kn extends rs{constructor(){super(),this.isMaterial=!0,Object.defineProperty(this,"id",{value:Kf++}),this.uuid=Fn(),this.name="",this.type="Material",this.blending=$i,this.side=Yn,this.vertexColors=!1,this.opacity=1,this.transparent=!1,this.alphaHash=!1,this.blendSrc=to,this.blendDst=eo,this.blendEquation=li,this.blendSrcAlpha=null,this.blendDstAlpha=null,this.blendEquationAlpha=null,this.blendColor=new Nt(0,0,0),this.blendAlpha=0,this.depthFunc=Zi,this.depthTest=!0,this.depthWrite=!0,this.stencilWriteMask=255,this.stencilFunc=zl,this.stencilRef=0,this.stencilFuncMask=255,this.stencilFail=Mi,this.stencilZFail=Mi,this.stencilZPass=Mi,this.stencilWrite=!1,this.clippingPlanes=null,this.clipIntersection=!1,this.clipShadows=!1,this.shadowSide=null,this.colorWrite=!0,this.precision=null,this.polygonOffset=!1,this.polygonOffsetFactor=0,this.polygonOffsetUnits=0,this.dithering=!1,this.alphaToCoverage=!1,this.premultipliedAlpha=!1,this.forceSinglePass=!1,this.allowOverride=!0,this.visible=!0,this.toneMapped=!0,this.userData={},this.version=0,this._alphaTest=0}get alphaTest(){return this._alphaTest}set alphaTest(t){this._alphaTest>0!=t>0&&this.version++,this._alphaTest=t}onBeforeRender(){}onBeforeCompile(){}customProgramCacheKey(){return this.onBeforeCompile.toString()}setValues(t){if(t!==void 0)for(const e in t){const n=t[e];if(n===void 0){console.warn(`THREE.Material: parameter '${e}' has value of undefined.`);continue}const s=this[e];if(s===void 0){console.warn(`THREE.Material: '${e}' is not a property of THREE.${this.type}.`);continue}s&&s.isColor?s.set(n):s&&s.isVector3&&n&&n.isVector3?s.copy(n):this[e]=n}}toJSON(t){const e=t===void 0||typeof t=="string";e&&(t={textures:{},images:{}});const n={metadata:{version:4.7,type:"Material",generator:"Material.toJSON"}};n.uuid=this.uuid,n.type=this.type,this.name!==""&&(n.name=this.name),this.color&&this.color.isColor&&(n.color=this.color.getHex()),this.roughness!==void 0&&(n.roughness=this.roughness),this.metalness!==void 0&&(n.metalness=this.metalness),this.sheen!==void 0&&(n.sheen=this.sheen),this.sheenColor&&this.sheenColor.isColor&&(n.sheenColor=this.sheenColor.getHex()),this.sheenRoughness!==void 0&&(n.sheenRoughness=this.sheenRoughness),this.emissive&&this.emissive.isColor&&(n.emissive=this.emissive.getHex()),this.emissiveIntensity!==void 0&&this.emissiveIntensity!==1&&(n.emissiveIntensity=this.emissiveIntensity),this.specular&&this.specular.isColor&&(n.specular=this.specular.getHex()),this.specularIntensity!==void 0&&(n.specularIntensity=this.specularIntensity),this.specularColor&&this.specularColor.isColor&&(n.specularColor=this.specularColor.getHex()),this.shininess!==void 0&&(n.shininess=this.shininess),this.clearcoat!==void 0&&(n.clearcoat=this.clearcoat),this.clearcoatRoughness!==void 0&&(n.clearcoatRoughness=this.clearcoatRoughness),this.clearcoatMap&&this.clearcoatMap.isTexture&&(n.clearcoatMap=this.clearcoatMap.toJSON(t).uuid),this.clearcoatRoughnessMap&&this.clearcoatRoughnessMap.isTexture&&(n.clearcoatRoughnessMap=this.clearcoatRoughnessMap.toJSON(t).uuid),this.clearcoatNormalMap&&this.clearcoatNormalMap.isTexture&&(n.clearcoatNormalMap=this.clearcoatNormalMap.toJSON(t).uuid,n.clearcoatNormalScale=this.clearcoatNormalScale.toArray()),this.sheenColorMap&&this.sheenColorMap.isTexture&&(n.sheenColorMap=this.sheenColorMap.toJSON(t).uuid),this.sheenRoughnessMap&&this.sheenRoughnessMap.isTexture&&(n.sheenRoughnessMap=this.sheenRoughnessMap.toJSON(t).uuid),this.dispersion!==void 0&&(n.dispersion=this.dispersion),this.iridescence!==void 0&&(n.iridescence=this.iridescence),this.iridescenceIOR!==void 0&&(n.iridescenceIOR=this.iridescenceIOR),this.iridescenceThicknessRange!==void 0&&(n.iridescenceThicknessRange=this.iridescenceThicknessRange),this.iridescenceMap&&this.iridescenceMap.isTexture&&(n.iridescenceMap=this.iridescenceMap.toJSON(t).uuid),this.iridescenceThicknessMap&&this.iridescenceThicknessMap.isTexture&&(n.iridescenceThicknessMap=this.iridescenceThicknessMap.toJSON(t).uuid),this.anisotropy!==void 0&&(n.anisotropy=this.anisotropy),this.anisotropyRotation!==void 0&&(n.anisotropyRotation=this.anisotropyRotation),this.anisotropyMap&&this.anisotropyMap.isTexture&&(n.anisotropyMap=this.anisotropyMap.toJSON(t).uuid),this.map&&this.map.isTexture&&(n.map=this.map.toJSON(t).uuid),this.matcap&&this.matcap.isTexture&&(n.matcap=this.matcap.toJSON(t).uuid),this.alphaMap&&this.alphaMap.isTexture&&(n.alphaMap=this.alphaMap.toJSON(t).uuid),this.lightMap&&this.lightMap.isTexture&&(n.lightMap=this.lightMap.toJSON(t).uuid,n.lightMapIntensity=this.lightMapIntensity),this.aoMap&&this.aoMap.isTexture&&(n.aoMap=this.aoMap.toJSON(t).uuid,n.aoMapIntensity=this.aoMapIntensity),this.bumpMap&&this.bumpMap.isTexture&&(n.bumpMap=this.bumpMap.toJSON(t).uuid,n.bumpScale=this.bumpScale),this.normalMap&&this.normalMap.isTexture&&(n.normalMap=this.normalMap.toJSON(t).uuid,n.normalMapType=this.normalMapType,n.normalScale=this.normalScale.toArray()),this.displacementMap&&this.displacementMap.isTexture&&(n.displacementMap=this.displacementMap.toJSON(t).uuid,n.displacementScale=this.displacementScale,n.displacementBias=this.displacementBias),this.roughnessMap&&this.roughnessMap.isTexture&&(n.roughnessMap=this.roughnessMap.toJSON(t).uuid),this.metalnessMap&&this.metalnessMap.isTexture&&(n.metalnessMap=this.metalnessMap.toJSON(t).uuid),this.emissiveMap&&this.emissiveMap.isTexture&&(n.emissiveMap=this.emissiveMap.toJSON(t).uuid),this.specularMap&&this.specularMap.isTexture&&(n.specularMap=this.specularMap.toJSON(t).uuid),this.specularIntensityMap&&this.specularIntensityMap.isTexture&&(n.specularIntensityMap=this.specularIntensityMap.toJSON(t).uuid),this.specularColorMap&&this.specularColorMap.isTexture&&(n.specularColorMap=this.specularColorMap.toJSON(t).uuid),this.envMap&&this.envMap.isTexture&&(n.envMap=this.envMap.toJSON(t).uuid,this.combine!==void 0&&(n.combine=this.combine)),this.envMapRotation!==void 0&&(n.envMapRotation=this.envMapRotation.toArray()),this.envMapIntensity!==void 0&&(n.envMapIntensity=this.envMapIntensity),this.reflectivity!==void 0&&(n.reflectivity=this.reflectivity),this.refractionRatio!==void 0&&(n.refractionRatio=this.refractionRatio),this.gradientMap&&this.gradientMap.isTexture&&(n.gradientMap=this.gradientMap.toJSON(t).uuid),this.transmission!==void 0&&(n.transmission=this.transmission),this.transmissionMap&&this.transmissionMap.isTexture&&(n.transmissionMap=this.transmissionMap.toJSON(t).uuid),this.thickness!==void 0&&(n.thickness=this.thickness),this.thicknessMap&&this.thicknessMap.isTexture&&(n.thicknessMap=this.thicknessMap.toJSON(t).uuid),this.attenuationDistance!==void 0&&this.attenuationDistance!==1/0&&(n.attenuationDistance=this.attenuationDistance),this.attenuationColor!==void 0&&(n.attenuationColor=this.attenuationColor.getHex()),this.size!==void 0&&(n.size=this.size),this.shadowSide!==null&&(n.shadowSide=this.shadowSide),this.sizeAttenuation!==void 0&&(n.sizeAttenuation=this.sizeAttenuation),this.blending!==$i&&(n.blending=this.blending),this.side!==Yn&&(n.side=this.side),this.vertexColors===!0&&(n.vertexColors=!0),this.opacity<1&&(n.opacity=this.opacity),this.transparent===!0&&(n.transparent=!0),this.blendSrc!==to&&(n.blendSrc=this.blendSrc),this.blendDst!==eo&&(n.blendDst=this.blendDst),this.blendEquation!==li&&(n.blendEquation=this.blendEquation),this.blendSrcAlpha!==null&&(n.blendSrcAlpha=this.blendSrcAlpha),this.blendDstAlpha!==null&&(n.blendDstAlpha=this.blendDstAlpha),this.blendEquationAlpha!==null&&(n.blendEquationAlpha=this.blendEquationAlpha),this.blendColor&&this.blendColor.isColor&&(n.blendColor=this.blendColor.getHex()),this.blendAlpha!==0&&(n.blendAlpha=this.blendAlpha),this.depthFunc!==Zi&&(n.depthFunc=this.depthFunc),this.depthTest===!1&&(n.depthTest=this.depthTest),this.depthWrite===!1&&(n.depthWrite=this.depthWrite),this.colorWrite===!1&&(n.colorWrite=this.colorWrite),this.stencilWriteMask!==255&&(n.stencilWriteMask=this.stencilWriteMask),this.stencilFunc!==zl&&(n.stencilFunc=this.stencilFunc),this.stencilRef!==0&&(n.stencilRef=this.stencilRef),this.stencilFuncMask!==255&&(n.stencilFuncMask=this.stencilFuncMask),this.stencilFail!==Mi&&(n.stencilFail=this.stencilFail),this.stencilZFail!==Mi&&(n.stencilZFail=this.stencilZFail),this.stencilZPass!==Mi&&(n.stencilZPass=this.stencilZPass),this.stencilWrite===!0&&(n.stencilWrite=this.stencilWrite),this.rotation!==void 0&&this.rotation!==0&&(n.rotation=this.rotation),this.polygonOffset===!0&&(n.polygonOffset=!0),this.polygonOffsetFactor!==0&&(n.polygonOffsetFactor=this.polygonOffsetFactor),this.polygonOffsetUnits!==0&&(n.polygonOffsetUnits=this.polygonOffsetUnits),this.linewidth!==void 0&&this.linewidth!==1&&(n.linewidth=this.linewidth),this.dashSize!==void 0&&(n.dashSize=this.dashSize),this.gapSize!==void 0&&(n.gapSize=this.gapSize),this.scale!==void 0&&(n.scale=this.scale),this.dithering===!0&&(n.dithering=!0),this.alphaTest>0&&(n.alphaTest=this.alphaTest),this.alphaHash===!0&&(n.alphaHash=!0),this.alphaToCoverage===!0&&(n.alphaToCoverage=!0),this.premultipliedAlpha===!0&&(n.premultipliedAlpha=!0),this.forceSinglePass===!0&&(n.forceSinglePass=!0),this.wireframe===!0&&(n.wireframe=!0),this.wireframeLinewidth>1&&(n.wireframeLinewidth=this.wireframeLinewidth),this.wireframeLinecap!=="round"&&(n.wireframeLinecap=this.wireframeLinecap),this.wireframeLinejoin!=="round"&&(n.wireframeLinejoin=this.wireframeLinejoin),this.flatShading===!0&&(n.flatShading=!0),this.visible===!1&&(n.visible=!1),this.toneMapped===!1&&(n.toneMapped=!1),this.fog===!1&&(n.fog=!1),Object.keys(this.userData).length>0&&(n.userData=this.userData);function s(r){const a=[];for(const o in r){const l=r[o];delete l.metadata,a.push(l)}return a}if(e){const r=s(t.textures),a=s(t.images);r.length>0&&(n.textures=r),a.length>0&&(n.images=a)}return n}clone(){return new this.constructor().copy(this)}copy(t){this.name=t.name,this.blending=t.blending,this.side=t.side,this.vertexColors=t.vertexColors,this.opacity=t.opacity,this.transparent=t.transparent,this.blendSrc=t.blendSrc,this.blendDst=t.blendDst,this.blendEquation=t.blendEquation,this.blendSrcAlpha=t.blendSrcAlpha,this.blendDstAlpha=t.blendDstAlpha,this.blendEquationAlpha=t.blendEquationAlpha,this.blendColor.copy(t.blendColor),this.blendAlpha=t.blendAlpha,this.depthFunc=t.depthFunc,this.depthTest=t.depthTest,this.depthWrite=t.depthWrite,this.stencilWriteMask=t.stencilWriteMask,this.stencilFunc=t.stencilFunc,this.stencilRef=t.stencilRef,this.stencilFuncMask=t.stencilFuncMask,this.stencilFail=t.stencilFail,this.stencilZFail=t.stencilZFail,this.stencilZPass=t.stencilZPass,this.stencilWrite=t.stencilWrite;const e=t.clippingPlanes;let n=null;if(e!==null){const s=e.length;n=new Array(s);for(let r=0;r!==s;++r)n[r]=e[r].clone()}return this.clippingPlanes=n,this.clipIntersection=t.clipIntersection,this.clipShadows=t.clipShadows,this.shadowSide=t.shadowSide,this.colorWrite=t.colorWrite,this.precision=t.precision,this.polygonOffset=t.polygonOffset,this.polygonOffsetFactor=t.polygonOffsetFactor,this.polygonOffsetUnits=t.polygonOffsetUnits,this.dithering=t.dithering,this.alphaTest=t.alphaTest,this.alphaHash=t.alphaHash,this.alphaToCoverage=t.alphaToCoverage,this.premultipliedAlpha=t.premultipliedAlpha,this.forceSinglePass=t.forceSinglePass,this.visible=t.visible,this.toneMapped=t.toneMapped,this.userData=JSON.parse(JSON.stringify(t.userData)),this}dispose(){this.dispatchEvent({type:"dispose"})}set needsUpdate(t){t===!0&&this.version++}}class ke extends Kn{constructor(t){super(),this.isMeshBasicMaterial=!0,this.type="MeshBasicMaterial",this.color=new Nt(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new Mn,this.combine=bh,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.fog=!0,this.setValues(t)}copy(t){return super.copy(t),this.color.copy(t.color),this.map=t.map,this.lightMap=t.lightMap,this.lightMapIntensity=t.lightMapIntensity,this.aoMap=t.aoMap,this.aoMapIntensity=t.aoMapIntensity,this.specularMap=t.specularMap,this.alphaMap=t.alphaMap,this.envMap=t.envMap,this.envMapRotation.copy(t.envMapRotation),this.combine=t.combine,this.reflectivity=t.reflectivity,this.refractionRatio=t.refractionRatio,this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this.wireframeLinecap=t.wireframeLinecap,this.wireframeLinejoin=t.wireframeLinejoin,this.fog=t.fog,this}}const _e=new B,nr=new ft;let Zf=0;class We{constructor(t,e,n=!1){if(Array.isArray(t))throw new TypeError("THREE.BufferAttribute: array should be a Typed Array.");this.isBufferAttribute=!0,Object.defineProperty(this,"id",{value:Zf++}),this.name="",this.array=t,this.itemSize=e,this.count=t!==void 0?t.length/e:0,this.normalized=n,this.usage=Ho,this.updateRanges=[],this.gpuType=vn,this.version=0}onUploadCallback(){}set needsUpdate(t){t===!0&&this.version++}setUsage(t){return this.usage=t,this}addUpdateRange(t,e){this.updateRanges.push({start:t,count:e})}clearUpdateRanges(){this.updateRanges.length=0}copy(t){return this.name=t.name,this.array=new t.array.constructor(t.array),this.itemSize=t.itemSize,this.count=t.count,this.normalized=t.normalized,this.usage=t.usage,this.gpuType=t.gpuType,this}copyAt(t,e,n){t*=this.itemSize,n*=e.itemSize;for(let s=0,r=this.itemSize;s<r;s++)this.array[t+s]=e.array[n+s];return this}copyArray(t){return this.array.set(t),this}applyMatrix3(t){if(this.itemSize===2)for(let e=0,n=this.count;e<n;e++)nr.fromBufferAttribute(this,e),nr.applyMatrix3(t),this.setXY(e,nr.x,nr.y);else if(this.itemSize===3)for(let e=0,n=this.count;e<n;e++)_e.fromBufferAttribute(this,e),_e.applyMatrix3(t),this.setXYZ(e,_e.x,_e.y,_e.z);return this}applyMatrix4(t){for(let e=0,n=this.count;e<n;e++)_e.fromBufferAttribute(this,e),_e.applyMatrix4(t),this.setXYZ(e,_e.x,_e.y,_e.z);return this}applyNormalMatrix(t){for(let e=0,n=this.count;e<n;e++)_e.fromBufferAttribute(this,e),_e.applyNormalMatrix(t),this.setXYZ(e,_e.x,_e.y,_e.z);return this}transformDirection(t){for(let e=0,n=this.count;e<n;e++)_e.fromBufferAttribute(this,e),_e.transformDirection(t),this.setXYZ(e,_e.x,_e.y,_e.z);return this}set(t,e=0){return this.array.set(t,e),this}getComponent(t,e){let n=this.array[t*this.itemSize+e];return this.normalized&&(n=mn(n,this.array)),n}setComponent(t,e,n){return this.normalized&&(n=oe(n,this.array)),this.array[t*this.itemSize+e]=n,this}getX(t){let e=this.array[t*this.itemSize];return this.normalized&&(e=mn(e,this.array)),e}setX(t,e){return this.normalized&&(e=oe(e,this.array)),this.array[t*this.itemSize]=e,this}getY(t){let e=this.array[t*this.itemSize+1];return this.normalized&&(e=mn(e,this.array)),e}setY(t,e){return this.normalized&&(e=oe(e,this.array)),this.array[t*this.itemSize+1]=e,this}getZ(t){let e=this.array[t*this.itemSize+2];return this.normalized&&(e=mn(e,this.array)),e}setZ(t,e){return this.normalized&&(e=oe(e,this.array)),this.array[t*this.itemSize+2]=e,this}getW(t){let e=this.array[t*this.itemSize+3];return this.normalized&&(e=mn(e,this.array)),e}setW(t,e){return this.normalized&&(e=oe(e,this.array)),this.array[t*this.itemSize+3]=e,this}setXY(t,e,n){return t*=this.itemSize,this.normalized&&(e=oe(e,this.array),n=oe(n,this.array)),this.array[t+0]=e,this.array[t+1]=n,this}setXYZ(t,e,n,s){return t*=this.itemSize,this.normalized&&(e=oe(e,this.array),n=oe(n,this.array),s=oe(s,this.array)),this.array[t+0]=e,this.array[t+1]=n,this.array[t+2]=s,this}setXYZW(t,e,n,s,r){return t*=this.itemSize,this.normalized&&(e=oe(e,this.array),n=oe(n,this.array),s=oe(s,this.array),r=oe(r,this.array)),this.array[t+0]=e,this.array[t+1]=n,this.array[t+2]=s,this.array[t+3]=r,this}onUpload(t){return this.onUploadCallback=t,this}clone(){return new this.constructor(this.array,this.itemSize).copy(this)}toJSON(){const t={itemSize:this.itemSize,type:this.array.constructor.name,array:Array.from(this.array),normalized:this.normalized};return this.name!==""&&(t.name=this.name),this.usage!==Ho&&(t.usage=this.usage),t}}class Oh extends We{constructor(t,e,n){super(new Uint16Array(t),e,n)}}class zh extends We{constructor(t,e,n){super(new Uint32Array(t),e,n)}}class qt extends We{constructor(t,e,n){super(new Float32Array(t),e,n)}}let jf=0;const sn=new se,Aa=new Se,Fi=new B,Ye=new Si,ps=new Si,Ee=new B;class fe extends rs{constructor(){super(),this.isBufferGeometry=!0,Object.defineProperty(this,"id",{value:jf++}),this.uuid=Fn(),this.name="",this.type="BufferGeometry",this.index=null,this.indirect=null,this.attributes={},this.morphAttributes={},this.morphTargetsRelative=!1,this.groups=[],this.boundingBox=null,this.boundingSphere=null,this.drawRange={start:0,count:1/0},this.userData={}}getIndex(){return this.index}setIndex(t){return Array.isArray(t)?this.index=new(Bh(t)?zh:Oh)(t,1):this.index=t,this}setIndirect(t){return this.indirect=t,this}getIndirect(){return this.indirect}getAttribute(t){return this.attributes[t]}setAttribute(t,e){return this.attributes[t]=e,this}deleteAttribute(t){return delete this.attributes[t],this}hasAttribute(t){return this.attributes[t]!==void 0}addGroup(t,e,n=0){this.groups.push({start:t,count:e,materialIndex:n})}clearGroups(){this.groups=[]}setDrawRange(t,e){this.drawRange.start=t,this.drawRange.count=e}applyMatrix4(t){const e=this.attributes.position;e!==void 0&&(e.applyMatrix4(t),e.needsUpdate=!0);const n=this.attributes.normal;if(n!==void 0){const r=new zt().getNormalMatrix(t);n.applyNormalMatrix(r),n.needsUpdate=!0}const s=this.attributes.tangent;return s!==void 0&&(s.transformDirection(t),s.needsUpdate=!0),this.boundingBox!==null&&this.computeBoundingBox(),this.boundingSphere!==null&&this.computeBoundingSphere(),this}applyQuaternion(t){return sn.makeRotationFromQuaternion(t),this.applyMatrix4(sn),this}rotateX(t){return sn.makeRotationX(t),this.applyMatrix4(sn),this}rotateY(t){return sn.makeRotationY(t),this.applyMatrix4(sn),this}rotateZ(t){return sn.makeRotationZ(t),this.applyMatrix4(sn),this}translate(t,e,n){return sn.makeTranslation(t,e,n),this.applyMatrix4(sn),this}scale(t,e,n){return sn.makeScale(t,e,n),this.applyMatrix4(sn),this}lookAt(t){return Aa.lookAt(t),Aa.updateMatrix(),this.applyMatrix4(Aa.matrix),this}center(){return this.computeBoundingBox(),this.boundingBox.getCenter(Fi).negate(),this.translate(Fi.x,Fi.y,Fi.z),this}setFromPoints(t){const e=this.getAttribute("position");if(e===void 0){const n=[];for(let s=0,r=t.length;s<r;s++){const a=t[s];n.push(a.x,a.y,a.z||0)}this.setAttribute("position",new qt(n,3))}else{const n=Math.min(t.length,e.count);for(let s=0;s<n;s++){const r=t[s];e.setXYZ(s,r.x,r.y,r.z||0)}t.length>e.count&&console.warn("THREE.BufferGeometry: Buffer size too small for points data. Use .dispose() and create a new geometry."),e.needsUpdate=!0}return this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new Si);const t=this.attributes.position,e=this.morphAttributes.position;if(t&&t.isGLBufferAttribute){console.error("THREE.BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box.",this),this.boundingBox.set(new B(-1/0,-1/0,-1/0),new B(1/0,1/0,1/0));return}if(t!==void 0){if(this.boundingBox.setFromBufferAttribute(t),e)for(let n=0,s=e.length;n<s;n++){const r=e[n];Ye.setFromBufferAttribute(r),this.morphTargetsRelative?(Ee.addVectors(this.boundingBox.min,Ye.min),this.boundingBox.expandByPoint(Ee),Ee.addVectors(this.boundingBox.max,Ye.max),this.boundingBox.expandByPoint(Ee)):(this.boundingBox.expandByPoint(Ye.min),this.boundingBox.expandByPoint(Ye.max))}}else this.boundingBox.makeEmpty();(isNaN(this.boundingBox.min.x)||isNaN(this.boundingBox.min.y)||isNaN(this.boundingBox.min.z))&&console.error('THREE.BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.',this)}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new xi);const t=this.attributes.position,e=this.morphAttributes.position;if(t&&t.isGLBufferAttribute){console.error("THREE.BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere.",this),this.boundingSphere.set(new B,1/0);return}if(t){const n=this.boundingSphere.center;if(Ye.setFromBufferAttribute(t),e)for(let r=0,a=e.length;r<a;r++){const o=e[r];ps.setFromBufferAttribute(o),this.morphTargetsRelative?(Ee.addVectors(Ye.min,ps.min),Ye.expandByPoint(Ee),Ee.addVectors(Ye.max,ps.max),Ye.expandByPoint(Ee)):(Ye.expandByPoint(ps.min),Ye.expandByPoint(ps.max))}Ye.getCenter(n);let s=0;for(let r=0,a=t.count;r<a;r++)Ee.fromBufferAttribute(t,r),s=Math.max(s,n.distanceToSquared(Ee));if(e)for(let r=0,a=e.length;r<a;r++){const o=e[r],l=this.morphTargetsRelative;for(let c=0,u=o.count;c<u;c++)Ee.fromBufferAttribute(o,c),l&&(Fi.fromBufferAttribute(t,c),Ee.add(Fi)),s=Math.max(s,n.distanceToSquared(Ee))}this.boundingSphere.radius=Math.sqrt(s),isNaN(this.boundingSphere.radius)&&console.error('THREE.BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.',this)}}computeTangents(){const t=this.index,e=this.attributes;if(t===null||e.position===void 0||e.normal===void 0||e.uv===void 0){console.error("THREE.BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)");return}const n=e.position,s=e.normal,r=e.uv;this.hasAttribute("tangent")===!1&&this.setAttribute("tangent",new We(new Float32Array(4*n.count),4));const a=this.getAttribute("tangent"),o=[],l=[];for(let A=0;A<n.count;A++)o[A]=new B,l[A]=new B;const c=new B,u=new B,h=new B,d=new ft,f=new ft,g=new ft,v=new B,m=new B;function p(A,_,y){c.fromBufferAttribute(n,A),u.fromBufferAttribute(n,_),h.fromBufferAttribute(n,y),d.fromBufferAttribute(r,A),f.fromBufferAttribute(r,_),g.fromBufferAttribute(r,y),u.sub(c),h.sub(c),f.sub(d),g.sub(d);const L=1/(f.x*g.y-g.x*f.y);isFinite(L)&&(v.copy(u).multiplyScalar(g.y).addScaledVector(h,-f.y).multiplyScalar(L),m.copy(h).multiplyScalar(f.x).addScaledVector(u,-g.x).multiplyScalar(L),o[A].add(v),o[_].add(v),o[y].add(v),l[A].add(m),l[_].add(m),l[y].add(m))}let M=this.groups;M.length===0&&(M=[{start:0,count:t.count}]);for(let A=0,_=M.length;A<_;++A){const y=M[A],L=y.start,U=y.count;for(let z=L,$=L+U;z<$;z+=3)p(t.getX(z+0),t.getX(z+1),t.getX(z+2))}const b=new B,x=new B,E=new B,T=new B;function C(A){E.fromBufferAttribute(s,A),T.copy(E);const _=o[A];b.copy(_),b.sub(E.multiplyScalar(E.dot(_))).normalize(),x.crossVectors(T,_);const L=x.dot(l[A])<0?-1:1;a.setXYZW(A,b.x,b.y,b.z,L)}for(let A=0,_=M.length;A<_;++A){const y=M[A],L=y.start,U=y.count;for(let z=L,$=L+U;z<$;z+=3)C(t.getX(z+0)),C(t.getX(z+1)),C(t.getX(z+2))}}computeVertexNormals(){const t=this.index,e=this.getAttribute("position");if(e!==void 0){let n=this.getAttribute("normal");if(n===void 0)n=new We(new Float32Array(e.count*3),3),this.setAttribute("normal",n);else for(let d=0,f=n.count;d<f;d++)n.setXYZ(d,0,0,0);const s=new B,r=new B,a=new B,o=new B,l=new B,c=new B,u=new B,h=new B;if(t)for(let d=0,f=t.count;d<f;d+=3){const g=t.getX(d+0),v=t.getX(d+1),m=t.getX(d+2);s.fromBufferAttribute(e,g),r.fromBufferAttribute(e,v),a.fromBufferAttribute(e,m),u.subVectors(a,r),h.subVectors(s,r),u.cross(h),o.fromBufferAttribute(n,g),l.fromBufferAttribute(n,v),c.fromBufferAttribute(n,m),o.add(u),l.add(u),c.add(u),n.setXYZ(g,o.x,o.y,o.z),n.setXYZ(v,l.x,l.y,l.z),n.setXYZ(m,c.x,c.y,c.z)}else for(let d=0,f=e.count;d<f;d+=3)s.fromBufferAttribute(e,d+0),r.fromBufferAttribute(e,d+1),a.fromBufferAttribute(e,d+2),u.subVectors(a,r),h.subVectors(s,r),u.cross(h),n.setXYZ(d+0,u.x,u.y,u.z),n.setXYZ(d+1,u.x,u.y,u.z),n.setXYZ(d+2,u.x,u.y,u.z);this.normalizeNormals(),n.needsUpdate=!0}}normalizeNormals(){const t=this.attributes.normal;for(let e=0,n=t.count;e<n;e++)Ee.fromBufferAttribute(t,e),Ee.normalize(),t.setXYZ(e,Ee.x,Ee.y,Ee.z)}toNonIndexed(){function t(o,l){const c=o.array,u=o.itemSize,h=o.normalized,d=new c.constructor(l.length*u);let f=0,g=0;for(let v=0,m=l.length;v<m;v++){o.isInterleavedBufferAttribute?f=l[v]*o.data.stride+o.offset:f=l[v]*u;for(let p=0;p<u;p++)d[g++]=c[f++]}return new We(d,u,h)}if(this.index===null)return console.warn("THREE.BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed."),this;const e=new fe,n=this.index.array,s=this.attributes;for(const o in s){const l=s[o],c=t(l,n);e.setAttribute(o,c)}const r=this.morphAttributes;for(const o in r){const l=[],c=r[o];for(let u=0,h=c.length;u<h;u++){const d=c[u],f=t(d,n);l.push(f)}e.morphAttributes[o]=l}e.morphTargetsRelative=this.morphTargetsRelative;const a=this.groups;for(let o=0,l=a.length;o<l;o++){const c=a[o];e.addGroup(c.start,c.count,c.materialIndex)}return e}toJSON(){const t={metadata:{version:4.7,type:"BufferGeometry",generator:"BufferGeometry.toJSON"}};if(t.uuid=this.uuid,t.type=this.type,this.name!==""&&(t.name=this.name),Object.keys(this.userData).length>0&&(t.userData=this.userData),this.parameters!==void 0){const l=this.parameters;for(const c in l)l[c]!==void 0&&(t[c]=l[c]);return t}t.data={attributes:{}};const e=this.index;e!==null&&(t.data.index={type:e.array.constructor.name,array:Array.prototype.slice.call(e.array)});const n=this.attributes;for(const l in n){const c=n[l];t.data.attributes[l]=c.toJSON(t.data)}const s={};let r=!1;for(const l in this.morphAttributes){const c=this.morphAttributes[l],u=[];for(let h=0,d=c.length;h<d;h++){const f=c[h];u.push(f.toJSON(t.data))}u.length>0&&(s[l]=u,r=!0)}r&&(t.data.morphAttributes=s,t.data.morphTargetsRelative=this.morphTargetsRelative);const a=this.groups;a.length>0&&(t.data.groups=JSON.parse(JSON.stringify(a)));const o=this.boundingSphere;return o!==null&&(t.data.boundingSphere=o.toJSON()),t}clone(){return new this.constructor().copy(this)}copy(t){this.index=null,this.attributes={},this.morphAttributes={},this.groups=[],this.boundingBox=null,this.boundingSphere=null;const e={};this.name=t.name;const n=t.index;n!==null&&this.setIndex(n.clone());const s=t.attributes;for(const c in s){const u=s[c];this.setAttribute(c,u.clone(e))}const r=t.morphAttributes;for(const c in r){const u=[],h=r[c];for(let d=0,f=h.length;d<f;d++)u.push(h[d].clone(e));this.morphAttributes[c]=u}this.morphTargetsRelative=t.morphTargetsRelative;const a=t.groups;for(let c=0,u=a.length;c<u;c++){const h=a[c];this.addGroup(h.start,h.count,h.materialIndex)}const o=t.boundingBox;o!==null&&(this.boundingBox=o.clone());const l=t.boundingSphere;return l!==null&&(this.boundingSphere=l.clone()),this.drawRange.start=t.drawRange.start,this.drawRange.count=t.drawRange.count,this.userData=t.userData,this}dispose(){this.dispatchEvent({type:"dispose"})}}const Ql=new se,ei=new Qr,ir=new xi,tc=new B,sr=new B,rr=new B,ar=new B,La=new B,or=new B,ec=new B,lr=new B;class Mt extends Se{constructor(t=new fe,e=new ke){super(),this.isMesh=!0,this.type="Mesh",this.geometry=t,this.material=e,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.count=1,this.updateMorphTargets()}copy(t,e){return super.copy(t,e),t.morphTargetInfluences!==void 0&&(this.morphTargetInfluences=t.morphTargetInfluences.slice()),t.morphTargetDictionary!==void 0&&(this.morphTargetDictionary=Object.assign({},t.morphTargetDictionary)),this.material=Array.isArray(t.material)?t.material.slice():t.material,this.geometry=t.geometry,this}updateMorphTargets(){const e=this.geometry.morphAttributes,n=Object.keys(e);if(n.length>0){const s=e[n[0]];if(s!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,a=s.length;r<a;r++){const o=s[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[o]=r}}}}getVertexPosition(t,e){const n=this.geometry,s=n.attributes.position,r=n.morphAttributes.position,a=n.morphTargetsRelative;e.fromBufferAttribute(s,t);const o=this.morphTargetInfluences;if(r&&o){or.set(0,0,0);for(let l=0,c=r.length;l<c;l++){const u=o[l],h=r[l];u!==0&&(La.fromBufferAttribute(h,t),a?or.addScaledVector(La,u):or.addScaledVector(La.sub(e),u))}e.add(or)}return e}raycast(t,e){const n=this.geometry,s=this.material,r=this.matrixWorld;s!==void 0&&(n.boundingSphere===null&&n.computeBoundingSphere(),ir.copy(n.boundingSphere),ir.applyMatrix4(r),ei.copy(t.ray).recast(t.near),!(ir.containsPoint(ei.origin)===!1&&(ei.intersectSphere(ir,tc)===null||ei.origin.distanceToSquared(tc)>(t.far-t.near)**2))&&(Ql.copy(r).invert(),ei.copy(t.ray).applyMatrix4(Ql),!(n.boundingBox!==null&&ei.intersectsBox(n.boundingBox)===!1)&&this._computeIntersections(t,e,ei)))}_computeIntersections(t,e,n){let s;const r=this.geometry,a=this.material,o=r.index,l=r.attributes.position,c=r.attributes.uv,u=r.attributes.uv1,h=r.attributes.normal,d=r.groups,f=r.drawRange;if(o!==null)if(Array.isArray(a))for(let g=0,v=d.length;g<v;g++){const m=d[g],p=a[m.materialIndex],M=Math.max(m.start,f.start),b=Math.min(o.count,Math.min(m.start+m.count,f.start+f.count));for(let x=M,E=b;x<E;x+=3){const T=o.getX(x),C=o.getX(x+1),A=o.getX(x+2);s=cr(this,p,t,n,c,u,h,T,C,A),s&&(s.faceIndex=Math.floor(x/3),s.face.materialIndex=m.materialIndex,e.push(s))}}else{const g=Math.max(0,f.start),v=Math.min(o.count,f.start+f.count);for(let m=g,p=v;m<p;m+=3){const M=o.getX(m),b=o.getX(m+1),x=o.getX(m+2);s=cr(this,a,t,n,c,u,h,M,b,x),s&&(s.faceIndex=Math.floor(m/3),e.push(s))}}else if(l!==void 0)if(Array.isArray(a))for(let g=0,v=d.length;g<v;g++){const m=d[g],p=a[m.materialIndex],M=Math.max(m.start,f.start),b=Math.min(l.count,Math.min(m.start+m.count,f.start+f.count));for(let x=M,E=b;x<E;x+=3){const T=x,C=x+1,A=x+2;s=cr(this,p,t,n,c,u,h,T,C,A),s&&(s.faceIndex=Math.floor(x/3),s.face.materialIndex=m.materialIndex,e.push(s))}}else{const g=Math.max(0,f.start),v=Math.min(l.count,f.start+f.count);for(let m=g,p=v;m<p;m+=3){const M=m,b=m+1,x=m+2;s=cr(this,a,t,n,c,u,h,M,b,x),s&&(s.faceIndex=Math.floor(m/3),e.push(s))}}}}function Qf(i,t,e,n,s,r,a,o){let l;if(t.side===Ie?l=n.intersectTriangle(a,r,s,!0,o):l=n.intersectTriangle(s,r,a,t.side===Yn,o),l===null)return null;lr.copy(o),lr.applyMatrix4(i.matrixWorld);const c=e.ray.origin.distanceTo(lr);return c<e.near||c>e.far?null:{distance:c,point:lr.clone(),object:i}}function cr(i,t,e,n,s,r,a,o,l,c){i.getVertexPosition(o,sr),i.getVertexPosition(l,rr),i.getVertexPosition(c,ar);const u=Qf(i,t,e,n,sr,rr,ar,ec);if(u){const h=new B;an.getBarycoord(ec,sr,rr,ar,h),s&&(u.uv=an.getInterpolatedAttribute(s,o,l,c,h,new ft)),r&&(u.uv1=an.getInterpolatedAttribute(r,o,l,c,h,new ft)),a&&(u.normal=an.getInterpolatedAttribute(a,o,l,c,h,new B),u.normal.dot(n.direction)>0&&u.normal.multiplyScalar(-1));const d={a:o,b:l,c,normal:new B,materialIndex:0};an.getNormal(sr,rr,ar,d.normal),u.face=d,u.barycoord=h}return u}class je extends fe{constructor(t=1,e=1,n=1,s=1,r=1,a=1){super(),this.type="BoxGeometry",this.parameters={width:t,height:e,depth:n,widthSegments:s,heightSegments:r,depthSegments:a};const o=this;s=Math.floor(s),r=Math.floor(r),a=Math.floor(a);const l=[],c=[],u=[],h=[];let d=0,f=0;g("z","y","x",-1,-1,n,e,t,a,r,0),g("z","y","x",1,-1,n,e,-t,a,r,1),g("x","z","y",1,1,t,n,e,s,a,2),g("x","z","y",1,-1,t,n,-e,s,a,3),g("x","y","z",1,-1,t,e,n,s,r,4),g("x","y","z",-1,-1,t,e,-n,s,r,5),this.setIndex(l),this.setAttribute("position",new qt(c,3)),this.setAttribute("normal",new qt(u,3)),this.setAttribute("uv",new qt(h,2));function g(v,m,p,M,b,x,E,T,C,A,_){const y=x/C,L=E/A,U=x/2,z=E/2,$=T/2,X=C+1,q=A+1;let Z=0,W=0;const rt=new B;for(let ut=0;ut<q;ut++){const Et=ut*L-z;for(let kt=0;kt<X;kt++){const Zt=kt*y-U;rt[v]=Zt*M,rt[m]=Et*b,rt[p]=$,c.push(rt.x,rt.y,rt.z),rt[v]=0,rt[m]=0,rt[p]=T>0?1:-1,u.push(rt.x,rt.y,rt.z),h.push(kt/C),h.push(1-ut/A),Z+=1}}for(let ut=0;ut<A;ut++)for(let Et=0;Et<C;Et++){const kt=d+Et+X*ut,Zt=d+Et+X*(ut+1),ee=d+(Et+1)+X*(ut+1),Yt=d+(Et+1)+X*ut;l.push(kt,Zt,Yt),l.push(Zt,ee,Yt),W+=6}o.addGroup(f,W,_),f+=W,d+=Z}}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new je(t.width,t.height,t.depth,t.widthSegments,t.heightSegments,t.depthSegments)}}function ns(i){const t={};for(const e in i){t[e]={};for(const n in i[e]){const s=i[e][n];s&&(s.isColor||s.isMatrix3||s.isMatrix4||s.isVector2||s.isVector3||s.isVector4||s.isTexture||s.isQuaternion)?s.isRenderTargetTexture?(console.warn("UniformsUtils: Textures of render targets cannot be cloned via cloneUniforms() or mergeUniforms()."),t[e][n]=null):t[e][n]=s.clone():Array.isArray(s)?t[e][n]=s.slice():t[e][n]=s}}return t}function Ne(i){const t={};for(let e=0;e<i.length;e++){const n=ns(i[e]);for(const s in n)t[s]=n[s]}return t}function tp(i){const t=[];for(let e=0;e<i.length;e++)t.push(i[e].clone());return t}function kh(i){const t=i.getRenderTarget();return t===null?i.outputColorSpace:t.isXRRenderTarget===!0?t.texture.colorSpace:Kt.workingColorSpace}const ep={clone:ns,merge:Ne};var np=`void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`,ip=`void main() {
	gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
}`;class Jn extends Kn{constructor(t){super(),this.isShaderMaterial=!0,this.type="ShaderMaterial",this.defines={},this.uniforms={},this.uniformsGroups=[],this.vertexShader=np,this.fragmentShader=ip,this.linewidth=1,this.wireframe=!1,this.wireframeLinewidth=1,this.fog=!1,this.lights=!1,this.clipping=!1,this.forceSinglePass=!0,this.extensions={clipCullDistance:!1,multiDraw:!1},this.defaultAttributeValues={color:[1,1,1],uv:[0,0],uv1:[0,0]},this.index0AttributeName=void 0,this.uniformsNeedUpdate=!1,this.glslVersion=null,t!==void 0&&this.setValues(t)}copy(t){return super.copy(t),this.fragmentShader=t.fragmentShader,this.vertexShader=t.vertexShader,this.uniforms=ns(t.uniforms),this.uniformsGroups=tp(t.uniformsGroups),this.defines=Object.assign({},t.defines),this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this.fog=t.fog,this.lights=t.lights,this.clipping=t.clipping,this.extensions=Object.assign({},t.extensions),this.glslVersion=t.glslVersion,this}toJSON(t){const e=super.toJSON(t);e.glslVersion=this.glslVersion,e.uniforms={};for(const s in this.uniforms){const a=this.uniforms[s].value;a&&a.isTexture?e.uniforms[s]={type:"t",value:a.toJSON(t).uuid}:a&&a.isColor?e.uniforms[s]={type:"c",value:a.getHex()}:a&&a.isVector2?e.uniforms[s]={type:"v2",value:a.toArray()}:a&&a.isVector3?e.uniforms[s]={type:"v3",value:a.toArray()}:a&&a.isVector4?e.uniforms[s]={type:"v4",value:a.toArray()}:a&&a.isMatrix3?e.uniforms[s]={type:"m3",value:a.toArray()}:a&&a.isMatrix4?e.uniforms[s]={type:"m4",value:a.toArray()}:e.uniforms[s]={value:a}}Object.keys(this.defines).length>0&&(e.defines=this.defines),e.vertexShader=this.vertexShader,e.fragmentShader=this.fragmentShader,e.lights=this.lights,e.clipping=this.clipping;const n={};for(const s in this.extensions)this.extensions[s]===!0&&(n[s]=!0);return Object.keys(n).length>0&&(e.extensions=n),e}}class Hh extends Se{constructor(){super(),this.isCamera=!0,this.type="Camera",this.matrixWorldInverse=new se,this.projectionMatrix=new se,this.projectionMatrixInverse=new se,this.coordinateSystem=Sn,this._reversedDepth=!1}get reversedDepth(){return this._reversedDepth}copy(t,e){return super.copy(t,e),this.matrixWorldInverse.copy(t.matrixWorldInverse),this.projectionMatrix.copy(t.projectionMatrix),this.projectionMatrixInverse.copy(t.projectionMatrixInverse),this.coordinateSystem=t.coordinateSystem,this}getWorldDirection(t){return super.getWorldDirection(t).negate()}updateMatrixWorld(t){super.updateMatrixWorld(t),this.matrixWorldInverse.copy(this.matrixWorld).invert()}updateWorldMatrix(t,e){super.updateWorldMatrix(t,e),this.matrixWorldInverse.copy(this.matrixWorld).invert()}clone(){return new this.constructor().copy(this)}}const zn=new B,nc=new ft,ic=new ft;class rn extends Hh{constructor(t=50,e=1,n=.1,s=2e3){super(),this.isPerspectiveCamera=!0,this.type="PerspectiveCamera",this.fov=t,this.zoom=1,this.near=n,this.far=s,this.focus=10,this.aspect=e,this.view=null,this.filmGauge=35,this.filmOffset=0,this.updateProjectionMatrix()}copy(t,e){return super.copy(t,e),this.fov=t.fov,this.zoom=t.zoom,this.near=t.near,this.far=t.far,this.focus=t.focus,this.aspect=t.aspect,this.view=t.view===null?null:Object.assign({},t.view),this.filmGauge=t.filmGauge,this.filmOffset=t.filmOffset,this}setFocalLength(t){const e=.5*this.getFilmHeight()/t;this.fov=Go*2*Math.atan(e),this.updateProjectionMatrix()}getFocalLength(){const t=Math.tan(ca*.5*this.fov);return .5*this.getFilmHeight()/t}getEffectiveFOV(){return Go*2*Math.atan(Math.tan(ca*.5*this.fov)/this.zoom)}getFilmWidth(){return this.filmGauge*Math.min(this.aspect,1)}getFilmHeight(){return this.filmGauge/Math.max(this.aspect,1)}getViewBounds(t,e,n){zn.set(-1,-1,.5).applyMatrix4(this.projectionMatrixInverse),e.set(zn.x,zn.y).multiplyScalar(-t/zn.z),zn.set(1,1,.5).applyMatrix4(this.projectionMatrixInverse),n.set(zn.x,zn.y).multiplyScalar(-t/zn.z)}getViewSize(t,e){return this.getViewBounds(t,nc,ic),e.subVectors(ic,nc)}setViewOffset(t,e,n,s,r,a){this.aspect=t/e,this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=t,this.view.fullHeight=e,this.view.offsetX=n,this.view.offsetY=s,this.view.width=r,this.view.height=a,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){const t=this.near;let e=t*Math.tan(ca*.5*this.fov)/this.zoom,n=2*e,s=this.aspect*n,r=-.5*s;const a=this.view;if(this.view!==null&&this.view.enabled){const l=a.fullWidth,c=a.fullHeight;r+=a.offsetX*s/l,e-=a.offsetY*n/c,s*=a.width/l,n*=a.height/c}const o=this.filmOffset;o!==0&&(r+=t*o/this.getFilmWidth()),this.projectionMatrix.makePerspective(r,r+s,e,e-n,t,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(t){const e=super.toJSON(t);return e.object.fov=this.fov,e.object.zoom=this.zoom,e.object.near=this.near,e.object.far=this.far,e.object.focus=this.focus,e.object.aspect=this.aspect,this.view!==null&&(e.object.view=Object.assign({},this.view)),e.object.filmGauge=this.filmGauge,e.object.filmOffset=this.filmOffset,e}}const Ii=-90,Di=1;class sp extends Se{constructor(t,e,n){super(),this.type="CubeCamera",this.renderTarget=n,this.coordinateSystem=null,this.activeMipmapLevel=0;const s=new rn(Ii,Di,t,e);s.layers=this.layers,this.add(s);const r=new rn(Ii,Di,t,e);r.layers=this.layers,this.add(r);const a=new rn(Ii,Di,t,e);a.layers=this.layers,this.add(a);const o=new rn(Ii,Di,t,e);o.layers=this.layers,this.add(o);const l=new rn(Ii,Di,t,e);l.layers=this.layers,this.add(l);const c=new rn(Ii,Di,t,e);c.layers=this.layers,this.add(c)}updateCoordinateSystem(){const t=this.coordinateSystem,e=this.children.concat(),[n,s,r,a,o,l]=e;for(const c of e)this.remove(c);if(t===Sn)n.up.set(0,1,0),n.lookAt(1,0,0),s.up.set(0,1,0),s.lookAt(-1,0,0),r.up.set(0,0,-1),r.lookAt(0,1,0),a.up.set(0,0,1),a.lookAt(0,-1,0),o.up.set(0,1,0),o.lookAt(0,0,1),l.up.set(0,1,0),l.lookAt(0,0,-1);else if(t===Xr)n.up.set(0,-1,0),n.lookAt(-1,0,0),s.up.set(0,-1,0),s.lookAt(1,0,0),r.up.set(0,0,1),r.lookAt(0,1,0),a.up.set(0,0,-1),a.lookAt(0,-1,0),o.up.set(0,-1,0),o.lookAt(0,0,1),l.up.set(0,-1,0),l.lookAt(0,0,-1);else throw new Error("THREE.CubeCamera.updateCoordinateSystem(): Invalid coordinate system: "+t);for(const c of e)this.add(c),c.updateMatrixWorld()}update(t,e){this.parent===null&&this.updateMatrixWorld();const{renderTarget:n,activeMipmapLevel:s}=this;this.coordinateSystem!==t.coordinateSystem&&(this.coordinateSystem=t.coordinateSystem,this.updateCoordinateSystem());const[r,a,o,l,c,u]=this.children,h=t.getRenderTarget(),d=t.getActiveCubeFace(),f=t.getActiveMipmapLevel(),g=t.xr.enabled;t.xr.enabled=!1;const v=n.texture.generateMipmaps;n.texture.generateMipmaps=!1,t.setRenderTarget(n,0,s),t.render(e,r),t.setRenderTarget(n,1,s),t.render(e,a),t.setRenderTarget(n,2,s),t.render(e,o),t.setRenderTarget(n,3,s),t.render(e,l),t.setRenderTarget(n,4,s),t.render(e,c),n.texture.generateMipmaps=v,t.setRenderTarget(n,5,s),t.render(e,u),t.setRenderTarget(h,d,f),t.xr.enabled=g,n.texture.needsPMREMUpdate=!0}}class Gh extends De{constructor(t=[],e=ji,n,s,r,a,o,l,c,u){super(t,e,n,s,r,a,o,l,c,u),this.isCubeTexture=!0,this.flipY=!1}get images(){return this.image}set images(t){this.image=t}}class rp extends mi{constructor(t=1,e={}){super(t,t,e),this.isWebGLCubeRenderTarget=!0;const n={width:t,height:t,depth:1},s=[n,n,n,n,n,n];this.texture=new Gh(s),this._setTextureOptions(e),this.texture.isRenderTargetTexture=!0}fromEquirectangularTexture(t,e){this.texture.type=e.type,this.texture.colorSpace=e.colorSpace,this.texture.generateMipmaps=e.generateMipmaps,this.texture.minFilter=e.minFilter,this.texture.magFilter=e.magFilter;const n={uniforms:{tEquirect:{value:null}},vertexShader:`

				varying vec3 vWorldDirection;

				vec3 transformDirection( in vec3 dir, in mat4 matrix ) {

					return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );

				}

				void main() {

					vWorldDirection = transformDirection( position, modelMatrix );

					#include <begin_vertex>
					#include <project_vertex>

				}
			`,fragmentShader:`

				uniform sampler2D tEquirect;

				varying vec3 vWorldDirection;

				#include <common>

				void main() {

					vec3 direction = normalize( vWorldDirection );

					vec2 sampleUV = equirectUv( direction );

					gl_FragColor = texture2D( tEquirect, sampleUV );

				}
			`},s=new je(5,5,5),r=new Jn({name:"CubemapFromEquirect",uniforms:ns(n.uniforms),vertexShader:n.vertexShader,fragmentShader:n.fragmentShader,side:Ie,blending:$n});r.uniforms.tEquirect.value=e;const a=new Mt(s,r),o=e.minFilter;return e.minFilter===di&&(e.minFilter=gn),new sp(1,10,this).update(t,a),e.minFilter=o,a.geometry.dispose(),a.material.dispose(),this}clear(t,e=!0,n=!0,s=!0){const r=t.getRenderTarget();for(let a=0;a<6;a++)t.setRenderTarget(this,a),t.clear(e,n,s);t.setRenderTarget(r)}}class ve extends Se{constructor(){super(),this.isGroup=!0,this.type="Group"}}const ap={type:"move"};class Pa{constructor(){this._targetRay=null,this._grip=null,this._hand=null}getHandSpace(){return this._hand===null&&(this._hand=new ve,this._hand.matrixAutoUpdate=!1,this._hand.visible=!1,this._hand.joints={},this._hand.inputState={pinching:!1}),this._hand}getTargetRaySpace(){return this._targetRay===null&&(this._targetRay=new ve,this._targetRay.matrixAutoUpdate=!1,this._targetRay.visible=!1,this._targetRay.hasLinearVelocity=!1,this._targetRay.linearVelocity=new B,this._targetRay.hasAngularVelocity=!1,this._targetRay.angularVelocity=new B),this._targetRay}getGripSpace(){return this._grip===null&&(this._grip=new ve,this._grip.matrixAutoUpdate=!1,this._grip.visible=!1,this._grip.hasLinearVelocity=!1,this._grip.linearVelocity=new B,this._grip.hasAngularVelocity=!1,this._grip.angularVelocity=new B),this._grip}dispatchEvent(t){return this._targetRay!==null&&this._targetRay.dispatchEvent(t),this._grip!==null&&this._grip.dispatchEvent(t),this._hand!==null&&this._hand.dispatchEvent(t),this}connect(t){if(t&&t.hand){const e=this._hand;if(e)for(const n of t.hand.values())this._getHandJoint(e,n)}return this.dispatchEvent({type:"connected",data:t}),this}disconnect(t){return this.dispatchEvent({type:"disconnected",data:t}),this._targetRay!==null&&(this._targetRay.visible=!1),this._grip!==null&&(this._grip.visible=!1),this._hand!==null&&(this._hand.visible=!1),this}update(t,e,n){let s=null,r=null,a=null;const o=this._targetRay,l=this._grip,c=this._hand;if(t&&e.session.visibilityState!=="visible-blurred"){if(c&&t.hand){a=!0;for(const v of t.hand.values()){const m=e.getJointPose(v,n),p=this._getHandJoint(c,v);m!==null&&(p.matrix.fromArray(m.transform.matrix),p.matrix.decompose(p.position,p.rotation,p.scale),p.matrixWorldNeedsUpdate=!0,p.jointRadius=m.radius),p.visible=m!==null}const u=c.joints["index-finger-tip"],h=c.joints["thumb-tip"],d=u.position.distanceTo(h.position),f=.02,g=.005;c.inputState.pinching&&d>f+g?(c.inputState.pinching=!1,this.dispatchEvent({type:"pinchend",handedness:t.handedness,target:this})):!c.inputState.pinching&&d<=f-g&&(c.inputState.pinching=!0,this.dispatchEvent({type:"pinchstart",handedness:t.handedness,target:this}))}else l!==null&&t.gripSpace&&(r=e.getPose(t.gripSpace,n),r!==null&&(l.matrix.fromArray(r.transform.matrix),l.matrix.decompose(l.position,l.rotation,l.scale),l.matrixWorldNeedsUpdate=!0,r.linearVelocity?(l.hasLinearVelocity=!0,l.linearVelocity.copy(r.linearVelocity)):l.hasLinearVelocity=!1,r.angularVelocity?(l.hasAngularVelocity=!0,l.angularVelocity.copy(r.angularVelocity)):l.hasAngularVelocity=!1));o!==null&&(s=e.getPose(t.targetRaySpace,n),s===null&&r!==null&&(s=r),s!==null&&(o.matrix.fromArray(s.transform.matrix),o.matrix.decompose(o.position,o.rotation,o.scale),o.matrixWorldNeedsUpdate=!0,s.linearVelocity?(o.hasLinearVelocity=!0,o.linearVelocity.copy(s.linearVelocity)):o.hasLinearVelocity=!1,s.angularVelocity?(o.hasAngularVelocity=!0,o.angularVelocity.copy(s.angularVelocity)):o.hasAngularVelocity=!1,this.dispatchEvent(ap)))}return o!==null&&(o.visible=s!==null),l!==null&&(l.visible=r!==null),c!==null&&(c.visible=a!==null),this}_getHandJoint(t,e){if(t.joints[e.jointName]===void 0){const n=new ve;n.matrixAutoUpdate=!1,n.visible=!1,t.joints[e.jointName]=n,t.add(n)}return t.joints[e.jointName]}}class cl{constructor(t,e=1,n=1e3){this.isFog=!0,this.name="",this.color=new Nt(t),this.near=e,this.far=n}clone(){return new cl(this.color,this.near,this.far)}toJSON(){return{type:"Fog",name:this.name,color:this.color.getHex(),near:this.near,far:this.far}}}class op extends Se{constructor(){super(),this.isScene=!0,this.type="Scene",this.background=null,this.environment=null,this.fog=null,this.backgroundBlurriness=0,this.backgroundIntensity=1,this.backgroundRotation=new Mn,this.environmentIntensity=1,this.environmentRotation=new Mn,this.overrideMaterial=null,typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}copy(t,e){return super.copy(t,e),t.background!==null&&(this.background=t.background.clone()),t.environment!==null&&(this.environment=t.environment.clone()),t.fog!==null&&(this.fog=t.fog.clone()),this.backgroundBlurriness=t.backgroundBlurriness,this.backgroundIntensity=t.backgroundIntensity,this.backgroundRotation.copy(t.backgroundRotation),this.environmentIntensity=t.environmentIntensity,this.environmentRotation.copy(t.environmentRotation),t.overrideMaterial!==null&&(this.overrideMaterial=t.overrideMaterial.clone()),this.matrixAutoUpdate=t.matrixAutoUpdate,this}toJSON(t){const e=super.toJSON(t);return this.fog!==null&&(e.object.fog=this.fog.toJSON()),this.backgroundBlurriness>0&&(e.object.backgroundBlurriness=this.backgroundBlurriness),this.backgroundIntensity!==1&&(e.object.backgroundIntensity=this.backgroundIntensity),e.object.backgroundRotation=this.backgroundRotation.toArray(),this.environmentIntensity!==1&&(e.object.environmentIntensity=this.environmentIntensity),e.object.environmentRotation=this.environmentRotation.toArray(),e}}class lp{constructor(t,e){this.isInterleavedBuffer=!0,this.array=t,this.stride=e,this.count=t!==void 0?t.length/e:0,this.usage=Ho,this.updateRanges=[],this.version=0,this.uuid=Fn()}onUploadCallback(){}set needsUpdate(t){t===!0&&this.version++}setUsage(t){return this.usage=t,this}addUpdateRange(t,e){this.updateRanges.push({start:t,count:e})}clearUpdateRanges(){this.updateRanges.length=0}copy(t){return this.array=new t.array.constructor(t.array),this.count=t.count,this.stride=t.stride,this.usage=t.usage,this}copyAt(t,e,n){t*=this.stride,n*=e.stride;for(let s=0,r=this.stride;s<r;s++)this.array[t+s]=e.array[n+s];return this}set(t,e=0){return this.array.set(t,e),this}clone(t){t.arrayBuffers===void 0&&(t.arrayBuffers={}),this.array.buffer._uuid===void 0&&(this.array.buffer._uuid=Fn()),t.arrayBuffers[this.array.buffer._uuid]===void 0&&(t.arrayBuffers[this.array.buffer._uuid]=this.array.slice(0).buffer);const e=new this.array.constructor(t.arrayBuffers[this.array.buffer._uuid]),n=new this.constructor(e,this.stride);return n.setUsage(this.usage),n}onUpload(t){return this.onUploadCallback=t,this}toJSON(t){return t.arrayBuffers===void 0&&(t.arrayBuffers={}),this.array.buffer._uuid===void 0&&(this.array.buffer._uuid=Fn()),t.arrayBuffers[this.array.buffer._uuid]===void 0&&(t.arrayBuffers[this.array.buffer._uuid]=Array.from(new Uint32Array(this.array.buffer))),{uuid:this.uuid,buffer:this.array.buffer._uuid,type:this.array.constructor.name,stride:this.stride}}}const Ue=new B;class Yr{constructor(t,e,n,s=!1){this.isInterleavedBufferAttribute=!0,this.name="",this.data=t,this.itemSize=e,this.offset=n,this.normalized=s}get count(){return this.data.count}get array(){return this.data.array}set needsUpdate(t){this.data.needsUpdate=t}applyMatrix4(t){for(let e=0,n=this.data.count;e<n;e++)Ue.fromBufferAttribute(this,e),Ue.applyMatrix4(t),this.setXYZ(e,Ue.x,Ue.y,Ue.z);return this}applyNormalMatrix(t){for(let e=0,n=this.count;e<n;e++)Ue.fromBufferAttribute(this,e),Ue.applyNormalMatrix(t),this.setXYZ(e,Ue.x,Ue.y,Ue.z);return this}transformDirection(t){for(let e=0,n=this.count;e<n;e++)Ue.fromBufferAttribute(this,e),Ue.transformDirection(t),this.setXYZ(e,Ue.x,Ue.y,Ue.z);return this}getComponent(t,e){let n=this.array[t*this.data.stride+this.offset+e];return this.normalized&&(n=mn(n,this.array)),n}setComponent(t,e,n){return this.normalized&&(n=oe(n,this.array)),this.data.array[t*this.data.stride+this.offset+e]=n,this}setX(t,e){return this.normalized&&(e=oe(e,this.array)),this.data.array[t*this.data.stride+this.offset]=e,this}setY(t,e){return this.normalized&&(e=oe(e,this.array)),this.data.array[t*this.data.stride+this.offset+1]=e,this}setZ(t,e){return this.normalized&&(e=oe(e,this.array)),this.data.array[t*this.data.stride+this.offset+2]=e,this}setW(t,e){return this.normalized&&(e=oe(e,this.array)),this.data.array[t*this.data.stride+this.offset+3]=e,this}getX(t){let e=this.data.array[t*this.data.stride+this.offset];return this.normalized&&(e=mn(e,this.array)),e}getY(t){let e=this.data.array[t*this.data.stride+this.offset+1];return this.normalized&&(e=mn(e,this.array)),e}getZ(t){let e=this.data.array[t*this.data.stride+this.offset+2];return this.normalized&&(e=mn(e,this.array)),e}getW(t){let e=this.data.array[t*this.data.stride+this.offset+3];return this.normalized&&(e=mn(e,this.array)),e}setXY(t,e,n){return t=t*this.data.stride+this.offset,this.normalized&&(e=oe(e,this.array),n=oe(n,this.array)),this.data.array[t+0]=e,this.data.array[t+1]=n,this}setXYZ(t,e,n,s){return t=t*this.data.stride+this.offset,this.normalized&&(e=oe(e,this.array),n=oe(n,this.array),s=oe(s,this.array)),this.data.array[t+0]=e,this.data.array[t+1]=n,this.data.array[t+2]=s,this}setXYZW(t,e,n,s,r){return t=t*this.data.stride+this.offset,this.normalized&&(e=oe(e,this.array),n=oe(n,this.array),s=oe(s,this.array),r=oe(r,this.array)),this.data.array[t+0]=e,this.data.array[t+1]=n,this.data.array[t+2]=s,this.data.array[t+3]=r,this}clone(t){if(t===void 0){console.log("THREE.InterleavedBufferAttribute.clone(): Cloning an interleaved buffer attribute will de-interleave buffer data.");const e=[];for(let n=0;n<this.count;n++){const s=n*this.data.stride+this.offset;for(let r=0;r<this.itemSize;r++)e.push(this.data.array[s+r])}return new We(new this.array.constructor(e),this.itemSize,this.normalized)}else return t.interleavedBuffers===void 0&&(t.interleavedBuffers={}),t.interleavedBuffers[this.data.uuid]===void 0&&(t.interleavedBuffers[this.data.uuid]=this.data.clone(t)),new Yr(t.interleavedBuffers[this.data.uuid],this.itemSize,this.offset,this.normalized)}toJSON(t){if(t===void 0){console.log("THREE.InterleavedBufferAttribute.toJSON(): Serializing an interleaved buffer attribute will de-interleave buffer data.");const e=[];for(let n=0;n<this.count;n++){const s=n*this.data.stride+this.offset;for(let r=0;r<this.itemSize;r++)e.push(this.data.array[s+r])}return{itemSize:this.itemSize,type:this.array.constructor.name,array:e,normalized:this.normalized}}else return t.interleavedBuffers===void 0&&(t.interleavedBuffers={}),t.interleavedBuffers[this.data.uuid]===void 0&&(t.interleavedBuffers[this.data.uuid]=this.data.toJSON(t)),{isInterleavedBufferAttribute:!0,itemSize:this.itemSize,data:this.data.uuid,offset:this.offset,normalized:this.normalized}}}class Vh extends Kn{constructor(t){super(),this.isSpriteMaterial=!0,this.type="SpriteMaterial",this.color=new Nt(16777215),this.map=null,this.alphaMap=null,this.rotation=0,this.sizeAttenuation=!0,this.transparent=!0,this.fog=!0,this.setValues(t)}copy(t){return super.copy(t),this.color.copy(t.color),this.map=t.map,this.alphaMap=t.alphaMap,this.rotation=t.rotation,this.sizeAttenuation=t.sizeAttenuation,this.fog=t.fog,this}}let Bi;const ms=new B,Ui=new B,Ni=new B,Oi=new ft,gs=new ft,Wh=new se,hr=new B,vs=new B,ur=new B,sc=new ft,Fa=new ft,rc=new ft;class cp extends Se{constructor(t=new Vh){if(super(),this.isSprite=!0,this.type="Sprite",Bi===void 0){Bi=new fe;const e=new Float32Array([-.5,-.5,0,0,0,.5,-.5,0,1,0,.5,.5,0,1,1,-.5,.5,0,0,1]),n=new lp(e,5);Bi.setIndex([0,1,2,0,2,3]),Bi.setAttribute("position",new Yr(n,3,0,!1)),Bi.setAttribute("uv",new Yr(n,2,3,!1))}this.geometry=Bi,this.material=t,this.center=new ft(.5,.5),this.count=1}raycast(t,e){t.camera===null&&console.error('THREE.Sprite: "Raycaster.camera" needs to be set in order to raycast against sprites.'),Ui.setFromMatrixScale(this.matrixWorld),Wh.copy(t.camera.matrixWorld),this.modelViewMatrix.multiplyMatrices(t.camera.matrixWorldInverse,this.matrixWorld),Ni.setFromMatrixPosition(this.modelViewMatrix),t.camera.isPerspectiveCamera&&this.material.sizeAttenuation===!1&&Ui.multiplyScalar(-Ni.z);const n=this.material.rotation;let s,r;n!==0&&(r=Math.cos(n),s=Math.sin(n));const a=this.center;dr(hr.set(-.5,-.5,0),Ni,a,Ui,s,r),dr(vs.set(.5,-.5,0),Ni,a,Ui,s,r),dr(ur.set(.5,.5,0),Ni,a,Ui,s,r),sc.set(0,0),Fa.set(1,0),rc.set(1,1);let o=t.ray.intersectTriangle(hr,vs,ur,!1,ms);if(o===null&&(dr(vs.set(-.5,.5,0),Ni,a,Ui,s,r),Fa.set(0,1),o=t.ray.intersectTriangle(hr,ur,vs,!1,ms),o===null))return;const l=t.ray.origin.distanceTo(ms);l<t.near||l>t.far||e.push({distance:l,point:ms.clone(),uv:an.getInterpolation(ms,hr,vs,ur,sc,Fa,rc,new ft),face:null,object:this})}copy(t,e){return super.copy(t,e),t.center!==void 0&&this.center.copy(t.center),this.material=t.material,this}}function dr(i,t,e,n,s,r){Oi.subVectors(i,e).addScalar(.5).multiply(n),s!==void 0?(gs.x=r*Oi.x-s*Oi.y,gs.y=s*Oi.x+r*Oi.y):gs.copy(Oi),i.copy(t),i.x+=gs.x,i.y+=gs.y,i.applyMatrix4(Wh)}class hp extends De{constructor(t=null,e=1,n=1,s,r,a,o,l,c=tn,u=tn,h,d){super(null,a,o,l,c,u,s,r,h,d),this.isDataTexture=!0,this.image={data:t,width:e,height:n},this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}}class Vo extends We{constructor(t,e,n,s=1){super(t,e,n),this.isInstancedBufferAttribute=!0,this.meshPerAttribute=s}copy(t){return super.copy(t),this.meshPerAttribute=t.meshPerAttribute,this}toJSON(){const t=super.toJSON();return t.meshPerAttribute=this.meshPerAttribute,t.isInstancedBufferAttribute=!0,t}}const zi=new se,ac=new se,fr=[],oc=new Si,up=new se,Ss=new Mt,xs=new xi;class dp extends Mt{constructor(t,e,n){super(t,e),this.isInstancedMesh=!0,this.instanceMatrix=new Vo(new Float32Array(n*16),16),this.instanceColor=null,this.morphTexture=null,this.count=n,this.boundingBox=null,this.boundingSphere=null;for(let s=0;s<n;s++)this.setMatrixAt(s,up)}computeBoundingBox(){const t=this.geometry,e=this.count;this.boundingBox===null&&(this.boundingBox=new Si),t.boundingBox===null&&t.computeBoundingBox(),this.boundingBox.makeEmpty();for(let n=0;n<e;n++)this.getMatrixAt(n,zi),oc.copy(t.boundingBox).applyMatrix4(zi),this.boundingBox.union(oc)}computeBoundingSphere(){const t=this.geometry,e=this.count;this.boundingSphere===null&&(this.boundingSphere=new xi),t.boundingSphere===null&&t.computeBoundingSphere(),this.boundingSphere.makeEmpty();for(let n=0;n<e;n++)this.getMatrixAt(n,zi),xs.copy(t.boundingSphere).applyMatrix4(zi),this.boundingSphere.union(xs)}copy(t,e){return super.copy(t,e),this.instanceMatrix.copy(t.instanceMatrix),t.morphTexture!==null&&(this.morphTexture=t.morphTexture.clone()),t.instanceColor!==null&&(this.instanceColor=t.instanceColor.clone()),this.count=t.count,t.boundingBox!==null&&(this.boundingBox=t.boundingBox.clone()),t.boundingSphere!==null&&(this.boundingSphere=t.boundingSphere.clone()),this}getColorAt(t,e){e.fromArray(this.instanceColor.array,t*3)}getMatrixAt(t,e){e.fromArray(this.instanceMatrix.array,t*16)}getMorphAt(t,e){const n=e.morphTargetInfluences,s=this.morphTexture.source.data.data,r=n.length+1,a=t*r+1;for(let o=0;o<n.length;o++)n[o]=s[a+o]}raycast(t,e){const n=this.matrixWorld,s=this.count;if(Ss.geometry=this.geometry,Ss.material=this.material,Ss.material!==void 0&&(this.boundingSphere===null&&this.computeBoundingSphere(),xs.copy(this.boundingSphere),xs.applyMatrix4(n),t.ray.intersectsSphere(xs)!==!1))for(let r=0;r<s;r++){this.getMatrixAt(r,zi),ac.multiplyMatrices(n,zi),Ss.matrixWorld=ac,Ss.raycast(t,fr);for(let a=0,o=fr.length;a<o;a++){const l=fr[a];l.instanceId=r,l.object=this,e.push(l)}fr.length=0}}setColorAt(t,e){this.instanceColor===null&&(this.instanceColor=new Vo(new Float32Array(this.instanceMatrix.count*3).fill(1),3)),e.toArray(this.instanceColor.array,t*3)}setMatrixAt(t,e){e.toArray(this.instanceMatrix.array,t*16)}setMorphAt(t,e){const n=e.morphTargetInfluences,s=n.length+1;this.morphTexture===null&&(this.morphTexture=new hp(new Float32Array(s*this.count),s,this.count,il,vn));const r=this.morphTexture.source.data.data;let a=0;for(let c=0;c<n.length;c++)a+=n[c];const o=this.geometry.morphTargetsRelative?1:1-a,l=s*t;r[l]=o,r.set(n,l+1)}updateMorphTargets(){}dispose(){this.dispatchEvent({type:"dispose"}),this.morphTexture!==null&&(this.morphTexture.dispose(),this.morphTexture=null)}}const Ia=new B,fp=new B,pp=new zt;class kn{constructor(t=new B(1,0,0),e=0){this.isPlane=!0,this.normal=t,this.constant=e}set(t,e){return this.normal.copy(t),this.constant=e,this}setComponents(t,e,n,s){return this.normal.set(t,e,n),this.constant=s,this}setFromNormalAndCoplanarPoint(t,e){return this.normal.copy(t),this.constant=-e.dot(this.normal),this}setFromCoplanarPoints(t,e,n){const s=Ia.subVectors(n,e).cross(fp.subVectors(t,e)).normalize();return this.setFromNormalAndCoplanarPoint(s,t),this}copy(t){return this.normal.copy(t.normal),this.constant=t.constant,this}normalize(){const t=1/this.normal.length();return this.normal.multiplyScalar(t),this.constant*=t,this}negate(){return this.constant*=-1,this.normal.negate(),this}distanceToPoint(t){return this.normal.dot(t)+this.constant}distanceToSphere(t){return this.distanceToPoint(t.center)-t.radius}projectPoint(t,e){return e.copy(t).addScaledVector(this.normal,-this.distanceToPoint(t))}intersectLine(t,e){const n=t.delta(Ia),s=this.normal.dot(n);if(s===0)return this.distanceToPoint(t.start)===0?e.copy(t.start):null;const r=-(t.start.dot(this.normal)+this.constant)/s;return r<0||r>1?null:e.copy(t.start).addScaledVector(n,r)}intersectsLine(t){const e=this.distanceToPoint(t.start),n=this.distanceToPoint(t.end);return e<0&&n>0||n<0&&e>0}intersectsBox(t){return t.intersectsPlane(this)}intersectsSphere(t){return t.intersectsPlane(this)}coplanarPoint(t){return t.copy(this.normal).multiplyScalar(-this.constant)}applyMatrix4(t,e){const n=e||pp.getNormalMatrix(t),s=this.coplanarPoint(Ia).applyMatrix4(t),r=this.normal.applyMatrix3(n).normalize();return this.constant=-s.dot(r),this}translate(t){return this.constant-=t.dot(this.normal),this}equals(t){return t.normal.equals(this.normal)&&t.constant===this.constant}clone(){return new this.constructor().copy(this)}}const ni=new xi,mp=new ft(.5,.5),pr=new B;class hl{constructor(t=new kn,e=new kn,n=new kn,s=new kn,r=new kn,a=new kn){this.planes=[t,e,n,s,r,a]}set(t,e,n,s,r,a){const o=this.planes;return o[0].copy(t),o[1].copy(e),o[2].copy(n),o[3].copy(s),o[4].copy(r),o[5].copy(a),this}copy(t){const e=this.planes;for(let n=0;n<6;n++)e[n].copy(t.planes[n]);return this}setFromProjectionMatrix(t,e=Sn,n=!1){const s=this.planes,r=t.elements,a=r[0],o=r[1],l=r[2],c=r[3],u=r[4],h=r[5],d=r[6],f=r[7],g=r[8],v=r[9],m=r[10],p=r[11],M=r[12],b=r[13],x=r[14],E=r[15];if(s[0].setComponents(c-a,f-u,p-g,E-M).normalize(),s[1].setComponents(c+a,f+u,p+g,E+M).normalize(),s[2].setComponents(c+o,f+h,p+v,E+b).normalize(),s[3].setComponents(c-o,f-h,p-v,E-b).normalize(),n)s[4].setComponents(l,d,m,x).normalize(),s[5].setComponents(c-l,f-d,p-m,E-x).normalize();else if(s[4].setComponents(c-l,f-d,p-m,E-x).normalize(),e===Sn)s[5].setComponents(c+l,f+d,p+m,E+x).normalize();else if(e===Xr)s[5].setComponents(l,d,m,x).normalize();else throw new Error("THREE.Frustum.setFromProjectionMatrix(): Invalid coordinate system: "+e);return this}intersectsObject(t){if(t.boundingSphere!==void 0)t.boundingSphere===null&&t.computeBoundingSphere(),ni.copy(t.boundingSphere).applyMatrix4(t.matrixWorld);else{const e=t.geometry;e.boundingSphere===null&&e.computeBoundingSphere(),ni.copy(e.boundingSphere).applyMatrix4(t.matrixWorld)}return this.intersectsSphere(ni)}intersectsSprite(t){ni.center.set(0,0,0);const e=mp.distanceTo(t.center);return ni.radius=.7071067811865476+e,ni.applyMatrix4(t.matrixWorld),this.intersectsSphere(ni)}intersectsSphere(t){const e=this.planes,n=t.center,s=-t.radius;for(let r=0;r<6;r++)if(e[r].distanceToPoint(n)<s)return!1;return!0}intersectsBox(t){const e=this.planes;for(let n=0;n<6;n++){const s=e[n];if(pr.x=s.normal.x>0?t.max.x:t.min.x,pr.y=s.normal.y>0?t.max.y:t.min.y,pr.z=s.normal.z>0?t.max.z:t.min.z,s.distanceToPoint(pr)<0)return!1}return!0}containsPoint(t){const e=this.planes;for(let n=0;n<6;n++)if(e[n].distanceToPoint(t)<0)return!1;return!0}clone(){return new this.constructor().copy(this)}}class Wo extends Kn{constructor(t){super(),this.isLineBasicMaterial=!0,this.type="LineBasicMaterial",this.color=new Nt(16777215),this.map=null,this.linewidth=1,this.linecap="round",this.linejoin="round",this.fog=!0,this.setValues(t)}copy(t){return super.copy(t),this.color.copy(t.color),this.map=t.map,this.linewidth=t.linewidth,this.linecap=t.linecap,this.linejoin=t.linejoin,this.fog=t.fog,this}}const Jr=new B,Kr=new B,lc=new se,_s=new Qr,mr=new xi,Da=new B,cc=new B;class gp extends Se{constructor(t=new fe,e=new Wo){super(),this.isLine=!0,this.type="Line",this.geometry=t,this.material=e,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.updateMorphTargets()}copy(t,e){return super.copy(t,e),this.material=Array.isArray(t.material)?t.material.slice():t.material,this.geometry=t.geometry,this}computeLineDistances(){const t=this.geometry;if(t.index===null){const e=t.attributes.position,n=[0];for(let s=1,r=e.count;s<r;s++)Jr.fromBufferAttribute(e,s-1),Kr.fromBufferAttribute(e,s),n[s]=n[s-1],n[s]+=Jr.distanceTo(Kr);t.setAttribute("lineDistance",new qt(n,1))}else console.warn("THREE.Line.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");return this}raycast(t,e){const n=this.geometry,s=this.matrixWorld,r=t.params.Line.threshold,a=n.drawRange;if(n.boundingSphere===null&&n.computeBoundingSphere(),mr.copy(n.boundingSphere),mr.applyMatrix4(s),mr.radius+=r,t.ray.intersectsSphere(mr)===!1)return;lc.copy(s).invert(),_s.copy(t.ray).applyMatrix4(lc);const o=r/((this.scale.x+this.scale.y+this.scale.z)/3),l=o*o,c=this.isLineSegments?2:1,u=n.index,d=n.attributes.position;if(u!==null){const f=Math.max(0,a.start),g=Math.min(u.count,a.start+a.count);for(let v=f,m=g-1;v<m;v+=c){const p=u.getX(v),M=u.getX(v+1),b=gr(this,t,_s,l,p,M,v);b&&e.push(b)}if(this.isLineLoop){const v=u.getX(g-1),m=u.getX(f),p=gr(this,t,_s,l,v,m,g-1);p&&e.push(p)}}else{const f=Math.max(0,a.start),g=Math.min(d.count,a.start+a.count);for(let v=f,m=g-1;v<m;v+=c){const p=gr(this,t,_s,l,v,v+1,v);p&&e.push(p)}if(this.isLineLoop){const v=gr(this,t,_s,l,g-1,f,g-1);v&&e.push(v)}}}updateMorphTargets(){const e=this.geometry.morphAttributes,n=Object.keys(e);if(n.length>0){const s=e[n[0]];if(s!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,a=s.length;r<a;r++){const o=s[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[o]=r}}}}}function gr(i,t,e,n,s,r,a){const o=i.geometry.attributes.position;if(Jr.fromBufferAttribute(o,s),Kr.fromBufferAttribute(o,r),e.distanceSqToSegment(Jr,Kr,Da,cc)>n)return;Da.applyMatrix4(i.matrixWorld);const c=t.ray.origin.distanceTo(Da);if(!(c<t.near||c>t.far))return{distance:c,point:cc.clone().applyMatrix4(i.matrixWorld),index:a,face:null,faceIndex:null,barycoord:null,object:i}}const hc=new B,uc=new B;class dc extends gp{constructor(t,e){super(t,e),this.isLineSegments=!0,this.type="LineSegments"}computeLineDistances(){const t=this.geometry;if(t.index===null){const e=t.attributes.position,n=[];for(let s=0,r=e.count;s<r;s+=2)hc.fromBufferAttribute(e,s),uc.fromBufferAttribute(e,s+1),n[s]=s===0?0:n[s-1],n[s+1]=n[s]+hc.distanceTo(uc);t.setAttribute("lineDistance",new qt(n,1))}else console.warn("THREE.LineSegments.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");return this}}class $o extends Kn{constructor(t){super(),this.isPointsMaterial=!0,this.type="PointsMaterial",this.color=new Nt(16777215),this.map=null,this.alphaMap=null,this.size=1,this.sizeAttenuation=!0,this.fog=!0,this.setValues(t)}copy(t){return super.copy(t),this.color.copy(t.color),this.map=t.map,this.alphaMap=t.alphaMap,this.size=t.size,this.sizeAttenuation=t.sizeAttenuation,this.fog=t.fog,this}}const fc=new se,Xo=new Qr,vr=new xi,Sr=new B;class pc extends Se{constructor(t=new fe,e=new $o){super(),this.isPoints=!0,this.type="Points",this.geometry=t,this.material=e,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.updateMorphTargets()}copy(t,e){return super.copy(t,e),this.material=Array.isArray(t.material)?t.material.slice():t.material,this.geometry=t.geometry,this}raycast(t,e){const n=this.geometry,s=this.matrixWorld,r=t.params.Points.threshold,a=n.drawRange;if(n.boundingSphere===null&&n.computeBoundingSphere(),vr.copy(n.boundingSphere),vr.applyMatrix4(s),vr.radius+=r,t.ray.intersectsSphere(vr)===!1)return;fc.copy(s).invert(),Xo.copy(t.ray).applyMatrix4(fc);const o=r/((this.scale.x+this.scale.y+this.scale.z)/3),l=o*o,c=n.index,h=n.attributes.position;if(c!==null){const d=Math.max(0,a.start),f=Math.min(c.count,a.start+a.count);for(let g=d,v=f;g<v;g++){const m=c.getX(g);Sr.fromBufferAttribute(h,m),mc(Sr,m,l,s,t,e,this)}}else{const d=Math.max(0,a.start),f=Math.min(h.count,a.start+a.count);for(let g=d,v=f;g<v;g++)Sr.fromBufferAttribute(h,g),mc(Sr,g,l,s,t,e,this)}}updateMorphTargets(){const e=this.geometry.morphAttributes,n=Object.keys(e);if(n.length>0){const s=e[n[0]];if(s!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,a=s.length;r<a;r++){const o=s[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[o]=r}}}}}function mc(i,t,e,n,s,r,a){const o=Xo.distanceSqToPoint(i);if(o<e){const l=new B;Xo.closestPointToPoint(i,l),l.applyMatrix4(n);const c=s.ray.origin.distanceTo(l);if(c<s.near||c>s.far)return;r.push({distance:c,distanceToRay:Math.sqrt(o),point:l,index:t,face:null,faceIndex:null,barycoord:null,object:a})}}class as extends De{constructor(t,e,n,s,r,a,o,l,c){super(t,e,n,s,r,a,o,l,c),this.isCanvasTexture=!0,this.needsUpdate=!0}}class $h extends De{constructor(t,e,n=pi,s,r,a,o=tn,l=tn,c,u=Bs,h=1){if(u!==Bs&&u!==Us)throw new Error("DepthTexture format must be either THREE.DepthFormat or THREE.DepthStencilFormat");const d={width:t,height:e,depth:h};super(d,s,r,a,o,l,u,n,c),this.isDepthTexture=!0,this.flipY=!1,this.generateMipmaps=!1,this.compareFunction=null}copy(t){return super.copy(t),this.source=new ol(Object.assign({},t.image)),this.compareFunction=t.compareFunction,this}toJSON(t){const e=super.toJSON(t);return this.compareFunction!==null&&(e.compareFunction=this.compareFunction),e}}class Xh extends De{constructor(t=null){super(),this.sourceTexture=t,this.isExternalTexture=!0}copy(t){return super.copy(t),this.sourceTexture=t.sourceTexture,this}}class ul extends fe{constructor(t=1,e=1,n=4,s=8,r=1){super(),this.type="CapsuleGeometry",this.parameters={radius:t,height:e,capSegments:n,radialSegments:s,heightSegments:r},e=Math.max(0,e),n=Math.max(1,Math.floor(n)),s=Math.max(3,Math.floor(s)),r=Math.max(1,Math.floor(r));const a=[],o=[],l=[],c=[],u=e/2,h=Math.PI/2*t,d=e,f=2*h+d,g=n*2+r,v=s+1,m=new B,p=new B;for(let M=0;M<=g;M++){let b=0,x=0,E=0,T=0;if(M<=n){const _=M/n,y=_*Math.PI/2;x=-u-t*Math.cos(y),E=t*Math.sin(y),T=-t*Math.cos(y),b=_*h}else if(M<=n+r){const _=(M-n)/r;x=-u+_*e,E=t,T=0,b=h+_*d}else{const _=(M-n-r)/n,y=_*Math.PI/2;x=u+t*Math.sin(y),E=t*Math.cos(y),T=t*Math.sin(y),b=h+d+_*h}const C=Math.max(0,Math.min(1,b/f));let A=0;M===0?A=.5/s:M===g&&(A=-.5/s);for(let _=0;_<=s;_++){const y=_/s,L=y*Math.PI*2,U=Math.sin(L),z=Math.cos(L);p.x=-E*z,p.y=x,p.z=E*U,o.push(p.x,p.y,p.z),m.set(-E*z,T,E*U),m.normalize(),l.push(m.x,m.y,m.z),c.push(y+A,C)}if(M>0){const _=(M-1)*v;for(let y=0;y<s;y++){const L=_+y,U=_+y+1,z=M*v+y,$=M*v+y+1;a.push(L,U,z),a.push(U,$,z)}}}this.setIndex(a),this.setAttribute("position",new qt(o,3)),this.setAttribute("normal",new qt(l,3)),this.setAttribute("uv",new qt(c,2))}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new ul(t.radius,t.height,t.capSegments,t.radialSegments,t.heightSegments)}}class gi extends fe{constructor(t=1,e=32,n=0,s=Math.PI*2){super(),this.type="CircleGeometry",this.parameters={radius:t,segments:e,thetaStart:n,thetaLength:s},e=Math.max(3,e);const r=[],a=[],o=[],l=[],c=new B,u=new ft;a.push(0,0,0),o.push(0,0,1),l.push(.5,.5);for(let h=0,d=3;h<=e;h++,d+=3){const f=n+h/e*s;c.x=t*Math.cos(f),c.y=t*Math.sin(f),a.push(c.x,c.y,c.z),o.push(0,0,1),u.x=(a[d]/t+1)/2,u.y=(a[d+1]/t+1)/2,l.push(u.x,u.y)}for(let h=1;h<=e;h++)r.push(h,h+1,0);this.setIndex(r),this.setAttribute("position",new qt(a,3)),this.setAttribute("normal",new qt(o,3)),this.setAttribute("uv",new qt(l,2))}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new gi(t.radius,t.segments,t.thetaStart,t.thetaLength)}}class qi extends fe{constructor(t=1,e=1,n=1,s=32,r=1,a=!1,o=0,l=Math.PI*2){super(),this.type="CylinderGeometry",this.parameters={radiusTop:t,radiusBottom:e,height:n,radialSegments:s,heightSegments:r,openEnded:a,thetaStart:o,thetaLength:l};const c=this;s=Math.floor(s),r=Math.floor(r);const u=[],h=[],d=[],f=[];let g=0;const v=[],m=n/2;let p=0;M(),a===!1&&(t>0&&b(!0),e>0&&b(!1)),this.setIndex(u),this.setAttribute("position",new qt(h,3)),this.setAttribute("normal",new qt(d,3)),this.setAttribute("uv",new qt(f,2));function M(){const x=new B,E=new B;let T=0;const C=(e-t)/n;for(let A=0;A<=r;A++){const _=[],y=A/r,L=y*(e-t)+t;for(let U=0;U<=s;U++){const z=U/s,$=z*l+o,X=Math.sin($),q=Math.cos($);E.x=L*X,E.y=-y*n+m,E.z=L*q,h.push(E.x,E.y,E.z),x.set(X,C,q).normalize(),d.push(x.x,x.y,x.z),f.push(z,1-y),_.push(g++)}v.push(_)}for(let A=0;A<s;A++)for(let _=0;_<r;_++){const y=v[_][A],L=v[_+1][A],U=v[_+1][A+1],z=v[_][A+1];(t>0||_!==0)&&(u.push(y,L,z),T+=3),(e>0||_!==r-1)&&(u.push(L,U,z),T+=3)}c.addGroup(p,T,0),p+=T}function b(x){const E=g,T=new ft,C=new B;let A=0;const _=x===!0?t:e,y=x===!0?1:-1;for(let U=1;U<=s;U++)h.push(0,m*y,0),d.push(0,y,0),f.push(.5,.5),g++;const L=g;for(let U=0;U<=s;U++){const $=U/s*l+o,X=Math.cos($),q=Math.sin($);C.x=_*q,C.y=m*y,C.z=_*X,h.push(C.x,C.y,C.z),d.push(0,y,0),T.x=X*.5+.5,T.y=q*.5*y+.5,f.push(T.x,T.y),g++}for(let U=0;U<s;U++){const z=E+U,$=L+U;x===!0?u.push($,$+1,z):u.push($+1,$,z),A+=3}c.addGroup(p,A,x===!0?1:2),p+=A}}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new qi(t.radiusTop,t.radiusBottom,t.height,t.radialSegments,t.heightSegments,t.openEnded,t.thetaStart,t.thetaLength)}}class bn{constructor(){this.type="Curve",this.arcLengthDivisions=200,this.needsUpdate=!1,this.cacheArcLengths=null}getPoint(){console.warn("THREE.Curve: .getPoint() not implemented.")}getPointAt(t,e){const n=this.getUtoTmapping(t);return this.getPoint(n,e)}getPoints(t=5){const e=[];for(let n=0;n<=t;n++)e.push(this.getPoint(n/t));return e}getSpacedPoints(t=5){const e=[];for(let n=0;n<=t;n++)e.push(this.getPointAt(n/t));return e}getLength(){const t=this.getLengths();return t[t.length-1]}getLengths(t=this.arcLengthDivisions){if(this.cacheArcLengths&&this.cacheArcLengths.length===t+1&&!this.needsUpdate)return this.cacheArcLengths;this.needsUpdate=!1;const e=[];let n,s=this.getPoint(0),r=0;e.push(0);for(let a=1;a<=t;a++)n=this.getPoint(a/t),r+=n.distanceTo(s),e.push(r),s=n;return this.cacheArcLengths=e,e}updateArcLengths(){this.needsUpdate=!0,this.getLengths()}getUtoTmapping(t,e=null){const n=this.getLengths();let s=0;const r=n.length;let a;e?a=e:a=t*n[r-1];let o=0,l=r-1,c;for(;o<=l;)if(s=Math.floor(o+(l-o)/2),c=n[s]-a,c<0)o=s+1;else if(c>0)l=s-1;else{l=s;break}if(s=l,n[s]===a)return s/(r-1);const u=n[s],d=n[s+1]-u,f=(a-u)/d;return(s+f)/(r-1)}getTangent(t,e){let s=t-1e-4,r=t+1e-4;s<0&&(s=0),r>1&&(r=1);const a=this.getPoint(s),o=this.getPoint(r),l=e||(a.isVector2?new ft:new B);return l.copy(o).sub(a).normalize(),l}getTangentAt(t,e){const n=this.getUtoTmapping(t);return this.getTangent(n,e)}computeFrenetFrames(t,e=!1){const n=new B,s=[],r=[],a=[],o=new B,l=new se;for(let f=0;f<=t;f++){const g=f/t;s[f]=this.getTangentAt(g,new B)}r[0]=new B,a[0]=new B;let c=Number.MAX_VALUE;const u=Math.abs(s[0].x),h=Math.abs(s[0].y),d=Math.abs(s[0].z);u<=c&&(c=u,n.set(1,0,0)),h<=c&&(c=h,n.set(0,1,0)),d<=c&&n.set(0,0,1),o.crossVectors(s[0],n).normalize(),r[0].crossVectors(s[0],o),a[0].crossVectors(s[0],r[0]);for(let f=1;f<=t;f++){if(r[f]=r[f-1].clone(),a[f]=a[f-1].clone(),o.crossVectors(s[f-1],s[f]),o.length()>Number.EPSILON){o.normalize();const g=Math.acos(Wt(s[f-1].dot(s[f]),-1,1));r[f].applyMatrix4(l.makeRotationAxis(o,g))}a[f].crossVectors(s[f],r[f])}if(e===!0){let f=Math.acos(Wt(r[0].dot(r[t]),-1,1));f/=t,s[0].dot(o.crossVectors(r[0],r[t]))>0&&(f=-f);for(let g=1;g<=t;g++)r[g].applyMatrix4(l.makeRotationAxis(s[g],f*g)),a[g].crossVectors(s[g],r[g])}return{tangents:s,normals:r,binormals:a}}clone(){return new this.constructor().copy(this)}copy(t){return this.arcLengthDivisions=t.arcLengthDivisions,this}toJSON(){const t={metadata:{version:4.7,type:"Curve",generator:"Curve.toJSON"}};return t.arcLengthDivisions=this.arcLengthDivisions,t.type=this.type,t}fromJSON(t){return this.arcLengthDivisions=t.arcLengthDivisions,this}}class dl extends bn{constructor(t=0,e=0,n=1,s=1,r=0,a=Math.PI*2,o=!1,l=0){super(),this.isEllipseCurve=!0,this.type="EllipseCurve",this.aX=t,this.aY=e,this.xRadius=n,this.yRadius=s,this.aStartAngle=r,this.aEndAngle=a,this.aClockwise=o,this.aRotation=l}getPoint(t,e=new ft){const n=e,s=Math.PI*2;let r=this.aEndAngle-this.aStartAngle;const a=Math.abs(r)<Number.EPSILON;for(;r<0;)r+=s;for(;r>s;)r-=s;r<Number.EPSILON&&(a?r=0:r=s),this.aClockwise===!0&&!a&&(r===s?r=-s:r=r-s);const o=this.aStartAngle+t*r;let l=this.aX+this.xRadius*Math.cos(o),c=this.aY+this.yRadius*Math.sin(o);if(this.aRotation!==0){const u=Math.cos(this.aRotation),h=Math.sin(this.aRotation),d=l-this.aX,f=c-this.aY;l=d*u-f*h+this.aX,c=d*h+f*u+this.aY}return n.set(l,c)}copy(t){return super.copy(t),this.aX=t.aX,this.aY=t.aY,this.xRadius=t.xRadius,this.yRadius=t.yRadius,this.aStartAngle=t.aStartAngle,this.aEndAngle=t.aEndAngle,this.aClockwise=t.aClockwise,this.aRotation=t.aRotation,this}toJSON(){const t=super.toJSON();return t.aX=this.aX,t.aY=this.aY,t.xRadius=this.xRadius,t.yRadius=this.yRadius,t.aStartAngle=this.aStartAngle,t.aEndAngle=this.aEndAngle,t.aClockwise=this.aClockwise,t.aRotation=this.aRotation,t}fromJSON(t){return super.fromJSON(t),this.aX=t.aX,this.aY=t.aY,this.xRadius=t.xRadius,this.yRadius=t.yRadius,this.aStartAngle=t.aStartAngle,this.aEndAngle=t.aEndAngle,this.aClockwise=t.aClockwise,this.aRotation=t.aRotation,this}}class vp extends dl{constructor(t,e,n,s,r,a){super(t,e,n,n,s,r,a),this.isArcCurve=!0,this.type="ArcCurve"}}function fl(){let i=0,t=0,e=0,n=0;function s(r,a,o,l){i=r,t=o,e=-3*r+3*a-2*o-l,n=2*r-2*a+o+l}return{initCatmullRom:function(r,a,o,l,c){s(a,o,c*(o-r),c*(l-a))},initNonuniformCatmullRom:function(r,a,o,l,c,u,h){let d=(a-r)/c-(o-r)/(c+u)+(o-a)/u,f=(o-a)/u-(l-a)/(u+h)+(l-o)/h;d*=u,f*=u,s(a,o,d,f)},calc:function(r){const a=r*r,o=a*r;return i+t*r+e*a+n*o}}}const xr=new B,Ba=new fl,Ua=new fl,Na=new fl;class Sp extends bn{constructor(t=[],e=!1,n="centripetal",s=.5){super(),this.isCatmullRomCurve3=!0,this.type="CatmullRomCurve3",this.points=t,this.closed=e,this.curveType=n,this.tension=s}getPoint(t,e=new B){const n=e,s=this.points,r=s.length,a=(r-(this.closed?0:1))*t;let o=Math.floor(a),l=a-o;this.closed?o+=o>0?0:(Math.floor(Math.abs(o)/r)+1)*r:l===0&&o===r-1&&(o=r-2,l=1);let c,u;this.closed||o>0?c=s[(o-1)%r]:(xr.subVectors(s[0],s[1]).add(s[0]),c=xr);const h=s[o%r],d=s[(o+1)%r];if(this.closed||o+2<r?u=s[(o+2)%r]:(xr.subVectors(s[r-1],s[r-2]).add(s[r-1]),u=xr),this.curveType==="centripetal"||this.curveType==="chordal"){const f=this.curveType==="chordal"?.5:.25;let g=Math.pow(c.distanceToSquared(h),f),v=Math.pow(h.distanceToSquared(d),f),m=Math.pow(d.distanceToSquared(u),f);v<1e-4&&(v=1),g<1e-4&&(g=v),m<1e-4&&(m=v),Ba.initNonuniformCatmullRom(c.x,h.x,d.x,u.x,g,v,m),Ua.initNonuniformCatmullRom(c.y,h.y,d.y,u.y,g,v,m),Na.initNonuniformCatmullRom(c.z,h.z,d.z,u.z,g,v,m)}else this.curveType==="catmullrom"&&(Ba.initCatmullRom(c.x,h.x,d.x,u.x,this.tension),Ua.initCatmullRom(c.y,h.y,d.y,u.y,this.tension),Na.initCatmullRom(c.z,h.z,d.z,u.z,this.tension));return n.set(Ba.calc(l),Ua.calc(l),Na.calc(l)),n}copy(t){super.copy(t),this.points=[];for(let e=0,n=t.points.length;e<n;e++){const s=t.points[e];this.points.push(s.clone())}return this.closed=t.closed,this.curveType=t.curveType,this.tension=t.tension,this}toJSON(){const t=super.toJSON();t.points=[];for(let e=0,n=this.points.length;e<n;e++){const s=this.points[e];t.points.push(s.toArray())}return t.closed=this.closed,t.curveType=this.curveType,t.tension=this.tension,t}fromJSON(t){super.fromJSON(t),this.points=[];for(let e=0,n=t.points.length;e<n;e++){const s=t.points[e];this.points.push(new B().fromArray(s))}return this.closed=t.closed,this.curveType=t.curveType,this.tension=t.tension,this}}function gc(i,t,e,n,s){const r=(n-t)*.5,a=(s-e)*.5,o=i*i,l=i*o;return(2*e-2*n+r+a)*l+(-3*e+3*n-2*r-a)*o+r*i+e}function xp(i,t){const e=1-i;return e*e*t}function _p(i,t){return 2*(1-i)*i*t}function yp(i,t){return i*i*t}function Es(i,t,e,n){return xp(i,t)+_p(i,e)+yp(i,n)}function Mp(i,t){const e=1-i;return e*e*e*t}function bp(i,t){const e=1-i;return 3*e*e*i*t}function Rp(i,t){return 3*(1-i)*i*i*t}function wp(i,t){return i*i*i*t}function Ts(i,t,e,n,s){return Mp(i,t)+bp(i,e)+Rp(i,n)+wp(i,s)}class qh extends bn{constructor(t=new ft,e=new ft,n=new ft,s=new ft){super(),this.isCubicBezierCurve=!0,this.type="CubicBezierCurve",this.v0=t,this.v1=e,this.v2=n,this.v3=s}getPoint(t,e=new ft){const n=e,s=this.v0,r=this.v1,a=this.v2,o=this.v3;return n.set(Ts(t,s.x,r.x,a.x,o.x),Ts(t,s.y,r.y,a.y,o.y)),n}copy(t){return super.copy(t),this.v0.copy(t.v0),this.v1.copy(t.v1),this.v2.copy(t.v2),this.v3.copy(t.v3),this}toJSON(){const t=super.toJSON();return t.v0=this.v0.toArray(),t.v1=this.v1.toArray(),t.v2=this.v2.toArray(),t.v3=this.v3.toArray(),t}fromJSON(t){return super.fromJSON(t),this.v0.fromArray(t.v0),this.v1.fromArray(t.v1),this.v2.fromArray(t.v2),this.v3.fromArray(t.v3),this}}class Ep extends bn{constructor(t=new B,e=new B,n=new B,s=new B){super(),this.isCubicBezierCurve3=!0,this.type="CubicBezierCurve3",this.v0=t,this.v1=e,this.v2=n,this.v3=s}getPoint(t,e=new B){const n=e,s=this.v0,r=this.v1,a=this.v2,o=this.v3;return n.set(Ts(t,s.x,r.x,a.x,o.x),Ts(t,s.y,r.y,a.y,o.y),Ts(t,s.z,r.z,a.z,o.z)),n}copy(t){return super.copy(t),this.v0.copy(t.v0),this.v1.copy(t.v1),this.v2.copy(t.v2),this.v3.copy(t.v3),this}toJSON(){const t=super.toJSON();return t.v0=this.v0.toArray(),t.v1=this.v1.toArray(),t.v2=this.v2.toArray(),t.v3=this.v3.toArray(),t}fromJSON(t){return super.fromJSON(t),this.v0.fromArray(t.v0),this.v1.fromArray(t.v1),this.v2.fromArray(t.v2),this.v3.fromArray(t.v3),this}}class Yh extends bn{constructor(t=new ft,e=new ft){super(),this.isLineCurve=!0,this.type="LineCurve",this.v1=t,this.v2=e}getPoint(t,e=new ft){const n=e;return t===1?n.copy(this.v2):(n.copy(this.v2).sub(this.v1),n.multiplyScalar(t).add(this.v1)),n}getPointAt(t,e){return this.getPoint(t,e)}getTangent(t,e=new ft){return e.subVectors(this.v2,this.v1).normalize()}getTangentAt(t,e){return this.getTangent(t,e)}copy(t){return super.copy(t),this.v1.copy(t.v1),this.v2.copy(t.v2),this}toJSON(){const t=super.toJSON();return t.v1=this.v1.toArray(),t.v2=this.v2.toArray(),t}fromJSON(t){return super.fromJSON(t),this.v1.fromArray(t.v1),this.v2.fromArray(t.v2),this}}class Tp extends bn{constructor(t=new B,e=new B){super(),this.isLineCurve3=!0,this.type="LineCurve3",this.v1=t,this.v2=e}getPoint(t,e=new B){const n=e;return t===1?n.copy(this.v2):(n.copy(this.v2).sub(this.v1),n.multiplyScalar(t).add(this.v1)),n}getPointAt(t,e){return this.getPoint(t,e)}getTangent(t,e=new B){return e.subVectors(this.v2,this.v1).normalize()}getTangentAt(t,e){return this.getTangent(t,e)}copy(t){return super.copy(t),this.v1.copy(t.v1),this.v2.copy(t.v2),this}toJSON(){const t=super.toJSON();return t.v1=this.v1.toArray(),t.v2=this.v2.toArray(),t}fromJSON(t){return super.fromJSON(t),this.v1.fromArray(t.v1),this.v2.fromArray(t.v2),this}}class Jh extends bn{constructor(t=new ft,e=new ft,n=new ft){super(),this.isQuadraticBezierCurve=!0,this.type="QuadraticBezierCurve",this.v0=t,this.v1=e,this.v2=n}getPoint(t,e=new ft){const n=e,s=this.v0,r=this.v1,a=this.v2;return n.set(Es(t,s.x,r.x,a.x),Es(t,s.y,r.y,a.y)),n}copy(t){return super.copy(t),this.v0.copy(t.v0),this.v1.copy(t.v1),this.v2.copy(t.v2),this}toJSON(){const t=super.toJSON();return t.v0=this.v0.toArray(),t.v1=this.v1.toArray(),t.v2=this.v2.toArray(),t}fromJSON(t){return super.fromJSON(t),this.v0.fromArray(t.v0),this.v1.fromArray(t.v1),this.v2.fromArray(t.v2),this}}class Cp extends bn{constructor(t=new B,e=new B,n=new B){super(),this.isQuadraticBezierCurve3=!0,this.type="QuadraticBezierCurve3",this.v0=t,this.v1=e,this.v2=n}getPoint(t,e=new B){const n=e,s=this.v0,r=this.v1,a=this.v2;return n.set(Es(t,s.x,r.x,a.x),Es(t,s.y,r.y,a.y),Es(t,s.z,r.z,a.z)),n}copy(t){return super.copy(t),this.v0.copy(t.v0),this.v1.copy(t.v1),this.v2.copy(t.v2),this}toJSON(){const t=super.toJSON();return t.v0=this.v0.toArray(),t.v1=this.v1.toArray(),t.v2=this.v2.toArray(),t}fromJSON(t){return super.fromJSON(t),this.v0.fromArray(t.v0),this.v1.fromArray(t.v1),this.v2.fromArray(t.v2),this}}class Kh extends bn{constructor(t=[]){super(),this.isSplineCurve=!0,this.type="SplineCurve",this.points=t}getPoint(t,e=new ft){const n=e,s=this.points,r=(s.length-1)*t,a=Math.floor(r),o=r-a,l=s[a===0?a:a-1],c=s[a],u=s[a>s.length-2?s.length-1:a+1],h=s[a>s.length-3?s.length-1:a+2];return n.set(gc(o,l.x,c.x,u.x,h.x),gc(o,l.y,c.y,u.y,h.y)),n}copy(t){super.copy(t),this.points=[];for(let e=0,n=t.points.length;e<n;e++){const s=t.points[e];this.points.push(s.clone())}return this}toJSON(){const t=super.toJSON();t.points=[];for(let e=0,n=this.points.length;e<n;e++){const s=this.points[e];t.points.push(s.toArray())}return t}fromJSON(t){super.fromJSON(t),this.points=[];for(let e=0,n=t.points.length;e<n;e++){const s=t.points[e];this.points.push(new ft().fromArray(s))}return this}}var vc=Object.freeze({__proto__:null,ArcCurve:vp,CatmullRomCurve3:Sp,CubicBezierCurve:qh,CubicBezierCurve3:Ep,EllipseCurve:dl,LineCurve:Yh,LineCurve3:Tp,QuadraticBezierCurve:Jh,QuadraticBezierCurve3:Cp,SplineCurve:Kh});class Ap extends bn{constructor(){super(),this.type="CurvePath",this.curves=[],this.autoClose=!1}add(t){this.curves.push(t)}closePath(){const t=this.curves[0].getPoint(0),e=this.curves[this.curves.length-1].getPoint(1);if(!t.equals(e)){const n=t.isVector2===!0?"LineCurve":"LineCurve3";this.curves.push(new vc[n](e,t))}return this}getPoint(t,e){const n=t*this.getLength(),s=this.getCurveLengths();let r=0;for(;r<s.length;){if(s[r]>=n){const a=s[r]-n,o=this.curves[r],l=o.getLength(),c=l===0?0:1-a/l;return o.getPointAt(c,e)}r++}return null}getLength(){const t=this.getCurveLengths();return t[t.length-1]}updateArcLengths(){this.needsUpdate=!0,this.cacheLengths=null,this.getCurveLengths()}getCurveLengths(){if(this.cacheLengths&&this.cacheLengths.length===this.curves.length)return this.cacheLengths;const t=[];let e=0;for(let n=0,s=this.curves.length;n<s;n++)e+=this.curves[n].getLength(),t.push(e);return this.cacheLengths=t,t}getSpacedPoints(t=40){const e=[];for(let n=0;n<=t;n++)e.push(this.getPoint(n/t));return this.autoClose&&e.push(e[0]),e}getPoints(t=12){const e=[];let n;for(let s=0,r=this.curves;s<r.length;s++){const a=r[s],o=a.isEllipseCurve?t*2:a.isLineCurve||a.isLineCurve3?1:a.isSplineCurve?t*a.points.length:t,l=a.getPoints(o);for(let c=0;c<l.length;c++){const u=l[c];n&&n.equals(u)||(e.push(u),n=u)}}return this.autoClose&&e.length>1&&!e[e.length-1].equals(e[0])&&e.push(e[0]),e}copy(t){super.copy(t),this.curves=[];for(let e=0,n=t.curves.length;e<n;e++){const s=t.curves[e];this.curves.push(s.clone())}return this.autoClose=t.autoClose,this}toJSON(){const t=super.toJSON();t.autoClose=this.autoClose,t.curves=[];for(let e=0,n=this.curves.length;e<n;e++){const s=this.curves[e];t.curves.push(s.toJSON())}return t}fromJSON(t){super.fromJSON(t),this.autoClose=t.autoClose,this.curves=[];for(let e=0,n=t.curves.length;e<n;e++){const s=t.curves[e];this.curves.push(new vc[s.type]().fromJSON(s))}return this}}class Sc extends Ap{constructor(t){super(),this.type="Path",this.currentPoint=new ft,t&&this.setFromPoints(t)}setFromPoints(t){this.moveTo(t[0].x,t[0].y);for(let e=1,n=t.length;e<n;e++)this.lineTo(t[e].x,t[e].y);return this}moveTo(t,e){return this.currentPoint.set(t,e),this}lineTo(t,e){const n=new Yh(this.currentPoint.clone(),new ft(t,e));return this.curves.push(n),this.currentPoint.set(t,e),this}quadraticCurveTo(t,e,n,s){const r=new Jh(this.currentPoint.clone(),new ft(t,e),new ft(n,s));return this.curves.push(r),this.currentPoint.set(n,s),this}bezierCurveTo(t,e,n,s,r,a){const o=new qh(this.currentPoint.clone(),new ft(t,e),new ft(n,s),new ft(r,a));return this.curves.push(o),this.currentPoint.set(r,a),this}splineThru(t){const e=[this.currentPoint.clone()].concat(t),n=new Kh(e);return this.curves.push(n),this.currentPoint.copy(t[t.length-1]),this}arc(t,e,n,s,r,a){const o=this.currentPoint.x,l=this.currentPoint.y;return this.absarc(t+o,e+l,n,s,r,a),this}absarc(t,e,n,s,r,a){return this.absellipse(t,e,n,n,s,r,a),this}ellipse(t,e,n,s,r,a,o,l){const c=this.currentPoint.x,u=this.currentPoint.y;return this.absellipse(t+c,e+u,n,s,r,a,o,l),this}absellipse(t,e,n,s,r,a,o,l){const c=new dl(t,e,n,s,r,a,o,l);if(this.curves.length>0){const h=c.getPoint(0);h.equals(this.currentPoint)||this.lineTo(h.x,h.y)}this.curves.push(c);const u=c.getPoint(1);return this.currentPoint.copy(u),this}copy(t){return super.copy(t),this.currentPoint.copy(t.currentPoint),this}toJSON(){const t=super.toJSON();return t.currentPoint=this.currentPoint.toArray(),t}fromJSON(t){return super.fromJSON(t),this.currentPoint.fromArray(t.currentPoint),this}}class pl extends Sc{constructor(t){super(t),this.uuid=Fn(),this.type="Shape",this.holes=[]}getPointsHoles(t){const e=[];for(let n=0,s=this.holes.length;n<s;n++)e[n]=this.holes[n].getPoints(t);return e}extractPoints(t){return{shape:this.getPoints(t),holes:this.getPointsHoles(t)}}copy(t){super.copy(t),this.holes=[];for(let e=0,n=t.holes.length;e<n;e++){const s=t.holes[e];this.holes.push(s.clone())}return this}toJSON(){const t=super.toJSON();t.uuid=this.uuid,t.holes=[];for(let e=0,n=this.holes.length;e<n;e++){const s=this.holes[e];t.holes.push(s.toJSON())}return t}fromJSON(t){super.fromJSON(t),this.uuid=t.uuid,this.holes=[];for(let e=0,n=t.holes.length;e<n;e++){const s=t.holes[e];this.holes.push(new Sc().fromJSON(s))}return this}}function Lp(i,t,e=2){const n=t&&t.length,s=n?t[0]*e:i.length;let r=Zh(i,0,s,e,!0);const a=[];if(!r||r.next===r.prev)return a;let o,l,c;if(n&&(r=Bp(i,t,r,e)),i.length>80*e){o=1/0,l=1/0;let u=-1/0,h=-1/0;for(let d=e;d<s;d+=e){const f=i[d],g=i[d+1];f<o&&(o=f),g<l&&(l=g),f>u&&(u=f),g>h&&(h=g)}c=Math.max(u-o,h-l),c=c!==0?32767/c:0}return Os(r,a,e,o,l,c,0),a}function Zh(i,t,e,n,s){let r;if(s===Xp(i,t,e,n)>0)for(let a=t;a<e;a+=n)r=xc(a/n|0,i[a],i[a+1],r);else for(let a=e-n;a>=t;a-=n)r=xc(a/n|0,i[a],i[a+1],r);return r&&is(r,r.next)&&(ks(r),r=r.next),r}function vi(i,t){if(!i)return i;t||(t=i);let e=i,n;do if(n=!1,!e.steiner&&(is(e,e.next)||de(e.prev,e,e.next)===0)){if(ks(e),e=t=e.prev,e===e.next)break;n=!0}else e=e.next;while(n||e!==t);return t}function Os(i,t,e,n,s,r,a){if(!i)return;!a&&r&&kp(i,n,s,r);let o=i;for(;i.prev!==i.next;){const l=i.prev,c=i.next;if(r?Fp(i,n,s,r):Pp(i)){t.push(l.i,i.i,c.i),ks(i),i=c.next,o=c.next;continue}if(i=c,i===o){a?a===1?(i=Ip(vi(i),t),Os(i,t,e,n,s,r,2)):a===2&&Dp(i,t,e,n,s,r):Os(vi(i),t,e,n,s,r,1);break}}}function Pp(i){const t=i.prev,e=i,n=i.next;if(de(t,e,n)>=0)return!1;const s=t.x,r=e.x,a=n.x,o=t.y,l=e.y,c=n.y,u=Math.min(s,r,a),h=Math.min(o,l,c),d=Math.max(s,r,a),f=Math.max(o,l,c);let g=n.next;for(;g!==t;){if(g.x>=u&&g.x<=d&&g.y>=h&&g.y<=f&&bs(s,o,r,l,a,c,g.x,g.y)&&de(g.prev,g,g.next)>=0)return!1;g=g.next}return!0}function Fp(i,t,e,n){const s=i.prev,r=i,a=i.next;if(de(s,r,a)>=0)return!1;const o=s.x,l=r.x,c=a.x,u=s.y,h=r.y,d=a.y,f=Math.min(o,l,c),g=Math.min(u,h,d),v=Math.max(o,l,c),m=Math.max(u,h,d),p=qo(f,g,t,e,n),M=qo(v,m,t,e,n);let b=i.prevZ,x=i.nextZ;for(;b&&b.z>=p&&x&&x.z<=M;){if(b.x>=f&&b.x<=v&&b.y>=g&&b.y<=m&&b!==s&&b!==a&&bs(o,u,l,h,c,d,b.x,b.y)&&de(b.prev,b,b.next)>=0||(b=b.prevZ,x.x>=f&&x.x<=v&&x.y>=g&&x.y<=m&&x!==s&&x!==a&&bs(o,u,l,h,c,d,x.x,x.y)&&de(x.prev,x,x.next)>=0))return!1;x=x.nextZ}for(;b&&b.z>=p;){if(b.x>=f&&b.x<=v&&b.y>=g&&b.y<=m&&b!==s&&b!==a&&bs(o,u,l,h,c,d,b.x,b.y)&&de(b.prev,b,b.next)>=0)return!1;b=b.prevZ}for(;x&&x.z<=M;){if(x.x>=f&&x.x<=v&&x.y>=g&&x.y<=m&&x!==s&&x!==a&&bs(o,u,l,h,c,d,x.x,x.y)&&de(x.prev,x,x.next)>=0)return!1;x=x.nextZ}return!0}function Ip(i,t){let e=i;do{const n=e.prev,s=e.next.next;!is(n,s)&&Qh(n,e,e.next,s)&&zs(n,s)&&zs(s,n)&&(t.push(n.i,e.i,s.i),ks(e),ks(e.next),e=i=s),e=e.next}while(e!==i);return vi(e)}function Dp(i,t,e,n,s,r){let a=i;do{let o=a.next.next;for(;o!==a.prev;){if(a.i!==o.i&&Vp(a,o)){let l=tu(a,o);a=vi(a,a.next),l=vi(l,l.next),Os(a,t,e,n,s,r,0),Os(l,t,e,n,s,r,0);return}o=o.next}a=a.next}while(a!==i)}function Bp(i,t,e,n){const s=[];for(let r=0,a=t.length;r<a;r++){const o=t[r]*n,l=r<a-1?t[r+1]*n:i.length,c=Zh(i,o,l,n,!1);c===c.next&&(c.steiner=!0),s.push(Gp(c))}s.sort(Up);for(let r=0;r<s.length;r++)e=Np(s[r],e);return e}function Up(i,t){let e=i.x-t.x;if(e===0&&(e=i.y-t.y,e===0)){const n=(i.next.y-i.y)/(i.next.x-i.x),s=(t.next.y-t.y)/(t.next.x-t.x);e=n-s}return e}function Np(i,t){const e=Op(i,t);if(!e)return t;const n=tu(e,i);return vi(n,n.next),vi(e,e.next)}function Op(i,t){let e=t;const n=i.x,s=i.y;let r=-1/0,a;if(is(i,e))return e;do{if(is(i,e.next))return e.next;if(s<=e.y&&s>=e.next.y&&e.next.y!==e.y){const h=e.x+(s-e.y)*(e.next.x-e.x)/(e.next.y-e.y);if(h<=n&&h>r&&(r=h,a=e.x<e.next.x?e:e.next,h===n))return a}e=e.next}while(e!==t);if(!a)return null;const o=a,l=a.x,c=a.y;let u=1/0;e=a;do{if(n>=e.x&&e.x>=l&&n!==e.x&&jh(s<c?n:r,s,l,c,s<c?r:n,s,e.x,e.y)){const h=Math.abs(s-e.y)/(n-e.x);zs(e,i)&&(h<u||h===u&&(e.x>a.x||e.x===a.x&&zp(a,e)))&&(a=e,u=h)}e=e.next}while(e!==o);return a}function zp(i,t){return de(i.prev,i,t.prev)<0&&de(t.next,i,i.next)<0}function kp(i,t,e,n){let s=i;do s.z===0&&(s.z=qo(s.x,s.y,t,e,n)),s.prevZ=s.prev,s.nextZ=s.next,s=s.next;while(s!==i);s.prevZ.nextZ=null,s.prevZ=null,Hp(s)}function Hp(i){let t,e=1;do{let n=i,s;i=null;let r=null;for(t=0;n;){t++;let a=n,o=0;for(let c=0;c<e&&(o++,a=a.nextZ,!!a);c++);let l=e;for(;o>0||l>0&&a;)o!==0&&(l===0||!a||n.z<=a.z)?(s=n,n=n.nextZ,o--):(s=a,a=a.nextZ,l--),r?r.nextZ=s:i=s,s.prevZ=r,r=s;n=a}r.nextZ=null,e*=2}while(t>1);return i}function qo(i,t,e,n,s){return i=(i-e)*s|0,t=(t-n)*s|0,i=(i|i<<8)&16711935,i=(i|i<<4)&252645135,i=(i|i<<2)&858993459,i=(i|i<<1)&1431655765,t=(t|t<<8)&16711935,t=(t|t<<4)&252645135,t=(t|t<<2)&858993459,t=(t|t<<1)&1431655765,i|t<<1}function Gp(i){let t=i,e=i;do(t.x<e.x||t.x===e.x&&t.y<e.y)&&(e=t),t=t.next;while(t!==i);return e}function jh(i,t,e,n,s,r,a,o){return(s-a)*(t-o)>=(i-a)*(r-o)&&(i-a)*(n-o)>=(e-a)*(t-o)&&(e-a)*(r-o)>=(s-a)*(n-o)}function bs(i,t,e,n,s,r,a,o){return!(i===a&&t===o)&&jh(i,t,e,n,s,r,a,o)}function Vp(i,t){return i.next.i!==t.i&&i.prev.i!==t.i&&!Wp(i,t)&&(zs(i,t)&&zs(t,i)&&$p(i,t)&&(de(i.prev,i,t.prev)||de(i,t.prev,t))||is(i,t)&&de(i.prev,i,i.next)>0&&de(t.prev,t,t.next)>0)}function de(i,t,e){return(t.y-i.y)*(e.x-t.x)-(t.x-i.x)*(e.y-t.y)}function is(i,t){return i.x===t.x&&i.y===t.y}function Qh(i,t,e,n){const s=yr(de(i,t,e)),r=yr(de(i,t,n)),a=yr(de(e,n,i)),o=yr(de(e,n,t));return!!(s!==r&&a!==o||s===0&&_r(i,e,t)||r===0&&_r(i,n,t)||a===0&&_r(e,i,n)||o===0&&_r(e,t,n))}function _r(i,t,e){return t.x<=Math.max(i.x,e.x)&&t.x>=Math.min(i.x,e.x)&&t.y<=Math.max(i.y,e.y)&&t.y>=Math.min(i.y,e.y)}function yr(i){return i>0?1:i<0?-1:0}function Wp(i,t){let e=i;do{if(e.i!==i.i&&e.next.i!==i.i&&e.i!==t.i&&e.next.i!==t.i&&Qh(e,e.next,i,t))return!0;e=e.next}while(e!==i);return!1}function zs(i,t){return de(i.prev,i,i.next)<0?de(i,t,i.next)>=0&&de(i,i.prev,t)>=0:de(i,t,i.prev)<0||de(i,i.next,t)<0}function $p(i,t){let e=i,n=!1;const s=(i.x+t.x)/2,r=(i.y+t.y)/2;do e.y>r!=e.next.y>r&&e.next.y!==e.y&&s<(e.next.x-e.x)*(r-e.y)/(e.next.y-e.y)+e.x&&(n=!n),e=e.next;while(e!==i);return n}function tu(i,t){const e=Yo(i.i,i.x,i.y),n=Yo(t.i,t.x,t.y),s=i.next,r=t.prev;return i.next=t,t.prev=i,e.next=s,s.prev=e,n.next=e,e.prev=n,r.next=n,n.prev=r,n}function xc(i,t,e,n){const s=Yo(i,t,e);return n?(s.next=n.next,s.prev=n,n.next.prev=s,n.next=s):(s.prev=s,s.next=s),s}function ks(i){i.next.prev=i.prev,i.prev.next=i.next,i.prevZ&&(i.prevZ.nextZ=i.nextZ),i.nextZ&&(i.nextZ.prevZ=i.prevZ)}function Yo(i,t,e){return{i,x:t,y:e,prev:null,next:null,z:0,prevZ:null,nextZ:null,steiner:!1}}function Xp(i,t,e,n){let s=0;for(let r=t,a=e-n;r<e;r+=n)s+=(i[a]-i[r])*(i[r+1]+i[a+1]),a=r;return s}class qp{static triangulate(t,e,n=2){return Lp(t,e,n)}}class Cs{static area(t){const e=t.length;let n=0;for(let s=e-1,r=0;r<e;s=r++)n+=t[s].x*t[r].y-t[r].x*t[s].y;return n*.5}static isClockWise(t){return Cs.area(t)<0}static triangulateShape(t,e){const n=[],s=[],r=[];_c(t),yc(n,t);let a=t.length;e.forEach(_c);for(let l=0;l<e.length;l++)s.push(a),a+=e[l].length,yc(n,e[l]);const o=qp.triangulate(n,s);for(let l=0;l<o.length;l+=3)r.push(o.slice(l,l+3));return r}}function _c(i){const t=i.length;t>2&&i[t-1].equals(i[0])&&i.pop()}function yc(i,t){for(let e=0;e<t.length;e++)i.push(t[e].x),i.push(t[e].y)}class on extends fe{constructor(t=1,e=1,n=1,s=1){super(),this.type="PlaneGeometry",this.parameters={width:t,height:e,widthSegments:n,heightSegments:s};const r=t/2,a=e/2,o=Math.floor(n),l=Math.floor(s),c=o+1,u=l+1,h=t/o,d=e/l,f=[],g=[],v=[],m=[];for(let p=0;p<u;p++){const M=p*d-a;for(let b=0;b<c;b++){const x=b*h-r;g.push(x,-M,0),v.push(0,0,1),m.push(b/o),m.push(1-p/l)}}for(let p=0;p<l;p++)for(let M=0;M<o;M++){const b=M+c*p,x=M+c*(p+1),E=M+1+c*(p+1),T=M+1+c*p;f.push(b,x,T),f.push(x,E,T)}this.setIndex(f),this.setAttribute("position",new qt(g,3)),this.setAttribute("normal",new qt(v,3)),this.setAttribute("uv",new qt(m,2))}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new on(t.width,t.height,t.widthSegments,t.heightSegments)}}class fi extends fe{constructor(t=.5,e=1,n=32,s=1,r=0,a=Math.PI*2){super(),this.type="RingGeometry",this.parameters={innerRadius:t,outerRadius:e,thetaSegments:n,phiSegments:s,thetaStart:r,thetaLength:a},n=Math.max(3,n),s=Math.max(1,s);const o=[],l=[],c=[],u=[];let h=t;const d=(e-t)/s,f=new B,g=new ft;for(let v=0;v<=s;v++){for(let m=0;m<=n;m++){const p=r+m/n*a;f.x=h*Math.cos(p),f.y=h*Math.sin(p),l.push(f.x,f.y,f.z),c.push(0,0,1),g.x=(f.x/e+1)/2,g.y=(f.y/e+1)/2,u.push(g.x,g.y)}h+=d}for(let v=0;v<s;v++){const m=v*(n+1);for(let p=0;p<n;p++){const M=p+m,b=M,x=M+n+1,E=M+n+2,T=M+1;o.push(b,x,T),o.push(x,E,T)}}this.setIndex(o),this.setAttribute("position",new qt(l,3)),this.setAttribute("normal",new qt(c,3)),this.setAttribute("uv",new qt(u,2))}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new fi(t.innerRadius,t.outerRadius,t.thetaSegments,t.phiSegments,t.thetaStart,t.thetaLength)}}class ta extends fe{constructor(t=new pl([new ft(0,.5),new ft(-.5,-.5),new ft(.5,-.5)]),e=12){super(),this.type="ShapeGeometry",this.parameters={shapes:t,curveSegments:e};const n=[],s=[],r=[],a=[];let o=0,l=0;if(Array.isArray(t)===!1)c(t);else for(let u=0;u<t.length;u++)c(t[u]),this.addGroup(o,l,u),o+=l,l=0;this.setIndex(n),this.setAttribute("position",new qt(s,3)),this.setAttribute("normal",new qt(r,3)),this.setAttribute("uv",new qt(a,2));function c(u){const h=s.length/3,d=u.extractPoints(e);let f=d.shape;const g=d.holes;Cs.isClockWise(f)===!1&&(f=f.reverse());for(let m=0,p=g.length;m<p;m++){const M=g[m];Cs.isClockWise(M)===!0&&(g[m]=M.reverse())}const v=Cs.triangulateShape(f,g);for(let m=0,p=g.length;m<p;m++){const M=g[m];f=f.concat(M)}for(let m=0,p=f.length;m<p;m++){const M=f[m];s.push(M.x,M.y,0),r.push(0,0,1),a.push(M.x,M.y)}for(let m=0,p=v.length;m<p;m++){const M=v[m],b=M[0]+h,x=M[1]+h,E=M[2]+h;n.push(b,x,E),l+=3}}}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}toJSON(){const t=super.toJSON(),e=this.parameters.shapes;return Yp(e,t)}static fromJSON(t,e){const n=[];for(let s=0,r=t.shapes.length;s<r;s++){const a=e[t.shapes[s]];n.push(a)}return new ta(n,t.curveSegments)}}function Yp(i,t){if(t.shapes=[],Array.isArray(i))for(let e=0,n=i.length;e<n;e++){const s=i[e];t.shapes.push(s.uuid)}else t.shapes.push(i.uuid);return t}class xn extends fe{constructor(t=1,e=32,n=16,s=0,r=Math.PI*2,a=0,o=Math.PI){super(),this.type="SphereGeometry",this.parameters={radius:t,widthSegments:e,heightSegments:n,phiStart:s,phiLength:r,thetaStart:a,thetaLength:o},e=Math.max(3,Math.floor(e)),n=Math.max(2,Math.floor(n));const l=Math.min(a+o,Math.PI);let c=0;const u=[],h=new B,d=new B,f=[],g=[],v=[],m=[];for(let p=0;p<=n;p++){const M=[],b=p/n;let x=0;p===0&&a===0?x=.5/e:p===n&&l===Math.PI&&(x=-.5/e);for(let E=0;E<=e;E++){const T=E/e;h.x=-t*Math.cos(s+T*r)*Math.sin(a+b*o),h.y=t*Math.cos(a+b*o),h.z=t*Math.sin(s+T*r)*Math.sin(a+b*o),g.push(h.x,h.y,h.z),d.copy(h).normalize(),v.push(d.x,d.y,d.z),m.push(T+x,1-b),M.push(c++)}u.push(M)}for(let p=0;p<n;p++)for(let M=0;M<e;M++){const b=u[p][M+1],x=u[p][M],E=u[p+1][M],T=u[p+1][M+1];(p!==0||a>0)&&f.push(b,x,T),(p!==n-1||l<Math.PI)&&f.push(x,E,T)}this.setIndex(f),this.setAttribute("position",new qt(g,3)),this.setAttribute("normal",new qt(v,3)),this.setAttribute("uv",new qt(m,2))}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new xn(t.radius,t.widthSegments,t.heightSegments,t.phiStart,t.phiLength,t.thetaStart,t.thetaLength)}}class ge extends Kn{constructor(t){super(),this.isMeshStandardMaterial=!0,this.type="MeshStandardMaterial",this.defines={STANDARD:""},this.color=new Nt(16777215),this.roughness=1,this.metalness=0,this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new Nt(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=Ih,this.normalScale=new ft(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.roughnessMap=null,this.metalnessMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new Mn,this.envMapIntensity=1,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.flatShading=!1,this.fog=!0,this.setValues(t)}copy(t){return super.copy(t),this.defines={STANDARD:""},this.color.copy(t.color),this.roughness=t.roughness,this.metalness=t.metalness,this.map=t.map,this.lightMap=t.lightMap,this.lightMapIntensity=t.lightMapIntensity,this.aoMap=t.aoMap,this.aoMapIntensity=t.aoMapIntensity,this.emissive.copy(t.emissive),this.emissiveMap=t.emissiveMap,this.emissiveIntensity=t.emissiveIntensity,this.bumpMap=t.bumpMap,this.bumpScale=t.bumpScale,this.normalMap=t.normalMap,this.normalMapType=t.normalMapType,this.normalScale.copy(t.normalScale),this.displacementMap=t.displacementMap,this.displacementScale=t.displacementScale,this.displacementBias=t.displacementBias,this.roughnessMap=t.roughnessMap,this.metalnessMap=t.metalnessMap,this.alphaMap=t.alphaMap,this.envMap=t.envMap,this.envMapRotation.copy(t.envMapRotation),this.envMapIntensity=t.envMapIntensity,this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this.wireframeLinecap=t.wireframeLinecap,this.wireframeLinejoin=t.wireframeLinejoin,this.flatShading=t.flatShading,this.fog=t.fog,this}}class Jp extends Kn{constructor(t){super(),this.isMeshDepthMaterial=!0,this.type="MeshDepthMaterial",this.depthPacking=Rf,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.wireframe=!1,this.wireframeLinewidth=1,this.setValues(t)}copy(t){return super.copy(t),this.depthPacking=t.depthPacking,this.map=t.map,this.alphaMap=t.alphaMap,this.displacementMap=t.displacementMap,this.displacementScale=t.displacementScale,this.displacementBias=t.displacementBias,this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this}}class Kp extends Kn{constructor(t){super(),this.isMeshDistanceMaterial=!0,this.type="MeshDistanceMaterial",this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.setValues(t)}copy(t){return super.copy(t),this.map=t.map,this.alphaMap=t.alphaMap,this.displacementMap=t.displacementMap,this.displacementScale=t.displacementScale,this.displacementBias=t.displacementBias,this}}class eu extends Se{constructor(t,e=1){super(),this.isLight=!0,this.type="Light",this.color=new Nt(t),this.intensity=e}dispose(){}copy(t,e){return super.copy(t,e),this.color.copy(t.color),this.intensity=t.intensity,this}toJSON(t){const e=super.toJSON(t);return e.object.color=this.color.getHex(),e.object.intensity=this.intensity,this.groundColor!==void 0&&(e.object.groundColor=this.groundColor.getHex()),this.distance!==void 0&&(e.object.distance=this.distance),this.angle!==void 0&&(e.object.angle=this.angle),this.decay!==void 0&&(e.object.decay=this.decay),this.penumbra!==void 0&&(e.object.penumbra=this.penumbra),this.shadow!==void 0&&(e.object.shadow=this.shadow.toJSON()),this.target!==void 0&&(e.object.target=this.target.uuid),e}}class Zp extends eu{constructor(t,e,n){super(t,n),this.isHemisphereLight=!0,this.type="HemisphereLight",this.position.copy(Se.DEFAULT_UP),this.updateMatrix(),this.groundColor=new Nt(e)}copy(t,e){return super.copy(t,e),this.groundColor.copy(t.groundColor),this}}const Oa=new se,Mc=new B,bc=new B;class jp{constructor(t){this.camera=t,this.intensity=1,this.bias=0,this.normalBias=0,this.radius=1,this.blurSamples=8,this.mapSize=new ft(512,512),this.mapType=yn,this.map=null,this.mapPass=null,this.matrix=new se,this.autoUpdate=!0,this.needsUpdate=!1,this._frustum=new hl,this._frameExtents=new ft(1,1),this._viewportCount=1,this._viewports=[new me(0,0,1,1)]}getViewportCount(){return this._viewportCount}getFrustum(){return this._frustum}updateMatrices(t){const e=this.camera,n=this.matrix;Mc.setFromMatrixPosition(t.matrixWorld),e.position.copy(Mc),bc.setFromMatrixPosition(t.target.matrixWorld),e.lookAt(bc),e.updateMatrixWorld(),Oa.multiplyMatrices(e.projectionMatrix,e.matrixWorldInverse),this._frustum.setFromProjectionMatrix(Oa,e.coordinateSystem,e.reversedDepth),e.reversedDepth?n.set(.5,0,0,.5,0,.5,0,.5,0,0,1,0,0,0,0,1):n.set(.5,0,0,.5,0,.5,0,.5,0,0,.5,.5,0,0,0,1),n.multiply(Oa)}getViewport(t){return this._viewports[t]}getFrameExtents(){return this._frameExtents}dispose(){this.map&&this.map.dispose(),this.mapPass&&this.mapPass.dispose()}copy(t){return this.camera=t.camera.clone(),this.intensity=t.intensity,this.bias=t.bias,this.radius=t.radius,this.autoUpdate=t.autoUpdate,this.needsUpdate=t.needsUpdate,this.normalBias=t.normalBias,this.blurSamples=t.blurSamples,this.mapSize.copy(t.mapSize),this}clone(){return new this.constructor().copy(this)}toJSON(){const t={};return this.intensity!==1&&(t.intensity=this.intensity),this.bias!==0&&(t.bias=this.bias),this.normalBias!==0&&(t.normalBias=this.normalBias),this.radius!==1&&(t.radius=this.radius),(this.mapSize.x!==512||this.mapSize.y!==512)&&(t.mapSize=this.mapSize.toArray()),t.camera=this.camera.toJSON(!1).object,delete t.camera.matrix,t}}class nu extends Hh{constructor(t=-1,e=1,n=1,s=-1,r=.1,a=2e3){super(),this.isOrthographicCamera=!0,this.type="OrthographicCamera",this.zoom=1,this.view=null,this.left=t,this.right=e,this.top=n,this.bottom=s,this.near=r,this.far=a,this.updateProjectionMatrix()}copy(t,e){return super.copy(t,e),this.left=t.left,this.right=t.right,this.top=t.top,this.bottom=t.bottom,this.near=t.near,this.far=t.far,this.zoom=t.zoom,this.view=t.view===null?null:Object.assign({},t.view),this}setViewOffset(t,e,n,s,r,a){this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=t,this.view.fullHeight=e,this.view.offsetX=n,this.view.offsetY=s,this.view.width=r,this.view.height=a,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){const t=(this.right-this.left)/(2*this.zoom),e=(this.top-this.bottom)/(2*this.zoom),n=(this.right+this.left)/2,s=(this.top+this.bottom)/2;let r=n-t,a=n+t,o=s+e,l=s-e;if(this.view!==null&&this.view.enabled){const c=(this.right-this.left)/this.view.fullWidth/this.zoom,u=(this.top-this.bottom)/this.view.fullHeight/this.zoom;r+=c*this.view.offsetX,a=r+c*this.view.width,o-=u*this.view.offsetY,l=o-u*this.view.height}this.projectionMatrix.makeOrthographic(r,a,o,l,this.near,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(t){const e=super.toJSON(t);return e.object.zoom=this.zoom,e.object.left=this.left,e.object.right=this.right,e.object.top=this.top,e.object.bottom=this.bottom,e.object.near=this.near,e.object.far=this.far,this.view!==null&&(e.object.view=Object.assign({},this.view)),e}}class Qp extends jp{constructor(){super(new nu(-5,5,5,-5,.5,500)),this.isDirectionalLightShadow=!0}}class Rc extends eu{constructor(t,e){super(t,e),this.isDirectionalLight=!0,this.type="DirectionalLight",this.position.copy(Se.DEFAULT_UP),this.updateMatrix(),this.target=new Se,this.shadow=new Qp}dispose(){this.shadow.dispose()}copy(t){return super.copy(t),this.target=t.target.clone(),this.shadow=t.shadow.clone(),this}}class tm extends rn{constructor(t=[]){super(),this.isArrayCamera=!0,this.isMultiViewCamera=!1,this.cameras=t}}const wc=new se;class em{constructor(t,e,n=0,s=1/0){this.ray=new Qr(t,e),this.near=n,this.far=s,this.camera=null,this.layers=new ll,this.params={Mesh:{},Line:{threshold:1},LOD:{},Points:{threshold:1},Sprite:{}}}set(t,e){this.ray.set(t,e)}setFromCamera(t,e){e.isPerspectiveCamera?(this.ray.origin.setFromMatrixPosition(e.matrixWorld),this.ray.direction.set(t.x,t.y,.5).unproject(e).sub(this.ray.origin).normalize(),this.camera=e):e.isOrthographicCamera?(this.ray.origin.set(t.x,t.y,(e.near+e.far)/(e.near-e.far)).unproject(e),this.ray.direction.set(0,0,-1).transformDirection(e.matrixWorld),this.camera=e):console.error("THREE.Raycaster: Unsupported camera type: "+e.type)}setFromXRController(t){return wc.identity().extractRotation(t.matrixWorld),this.ray.origin.setFromMatrixPosition(t.matrixWorld),this.ray.direction.set(0,0,-1).applyMatrix4(wc),this}intersectObject(t,e=!0,n=[]){return Jo(t,this,n,e),n.sort(Ec),n}intersectObjects(t,e=!0,n=[]){for(let s=0,r=t.length;s<r;s++)Jo(t[s],this,n,e);return n.sort(Ec),n}}function Ec(i,t){return i.distance-t.distance}function Jo(i,t,e,n){let s=!0;if(i.layers.test(t.layers)&&i.raycast(t,e)===!1&&(s=!1),s===!0&&n===!0){const r=i.children;for(let a=0,o=r.length;a<o;a++)Jo(r[a],t,e,!0)}}function Tc(i,t,e,n){const s=nm(n);switch(e){case Lh:return i*t;case il:return i*t/s.components*s.byteLength;case sl:return i*t/s.components*s.byteLength;case Fh:return i*t*2/s.components*s.byteLength;case rl:return i*t*2/s.components*s.byteLength;case Ph:return i*t*3/s.components*s.byteLength;case dn:return i*t*4/s.components*s.byteLength;case al:return i*t*4/s.components*s.byteLength;case Dr:case Br:return Math.floor((i+3)/4)*Math.floor((t+3)/4)*8;case Ur:case Nr:return Math.floor((i+3)/4)*Math.floor((t+3)/4)*16;case po:case go:return Math.max(i,16)*Math.max(t,8)/4;case fo:case mo:return Math.max(i,8)*Math.max(t,8)/2;case vo:case So:return Math.floor((i+3)/4)*Math.floor((t+3)/4)*8;case xo:return Math.floor((i+3)/4)*Math.floor((t+3)/4)*16;case _o:return Math.floor((i+3)/4)*Math.floor((t+3)/4)*16;case yo:return Math.floor((i+4)/5)*Math.floor((t+3)/4)*16;case Mo:return Math.floor((i+4)/5)*Math.floor((t+4)/5)*16;case bo:return Math.floor((i+5)/6)*Math.floor((t+4)/5)*16;case Ro:return Math.floor((i+5)/6)*Math.floor((t+5)/6)*16;case wo:return Math.floor((i+7)/8)*Math.floor((t+4)/5)*16;case Eo:return Math.floor((i+7)/8)*Math.floor((t+5)/6)*16;case To:return Math.floor((i+7)/8)*Math.floor((t+7)/8)*16;case Co:return Math.floor((i+9)/10)*Math.floor((t+4)/5)*16;case Ao:return Math.floor((i+9)/10)*Math.floor((t+5)/6)*16;case Lo:return Math.floor((i+9)/10)*Math.floor((t+7)/8)*16;case Po:return Math.floor((i+9)/10)*Math.floor((t+9)/10)*16;case Fo:return Math.floor((i+11)/12)*Math.floor((t+9)/10)*16;case Io:return Math.floor((i+11)/12)*Math.floor((t+11)/12)*16;case Do:case Bo:case Uo:return Math.ceil(i/4)*Math.ceil(t/4)*16;case No:case Oo:return Math.ceil(i/4)*Math.ceil(t/4)*8;case zo:case ko:return Math.ceil(i/4)*Math.ceil(t/4)*16}throw new Error(`Unable to determine texture byte length for ${e} format.`)}function nm(i){switch(i){case yn:case Eh:return{byteLength:1,components:1};case Is:case Th:case Gs:return{byteLength:2,components:1};case el:case nl:return{byteLength:2,components:4};case pi:case tl:case vn:return{byteLength:4,components:1};case Ch:case Ah:return{byteLength:4,components:3}}throw new Error(`Unknown texture type ${i}.`)}typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("register",{detail:{revision:Qo}}));typeof window<"u"&&(window.__THREE__?console.warn("WARNING: Multiple instances of Three.js being imported."):window.__THREE__=Qo);/**
 * @license
 * Copyright 2010-2025 Three.js Authors
 * SPDX-License-Identifier: MIT
 */function iu(){let i=null,t=!1,e=null,n=null;function s(r,a){e(r,a),n=i.requestAnimationFrame(s)}return{start:function(){t!==!0&&e!==null&&(n=i.requestAnimationFrame(s),t=!0)},stop:function(){i.cancelAnimationFrame(n),t=!1},setAnimationLoop:function(r){e=r},setContext:function(r){i=r}}}function im(i){const t=new WeakMap;function e(o,l){const c=o.array,u=o.usage,h=c.byteLength,d=i.createBuffer();i.bindBuffer(l,d),i.bufferData(l,c,u),o.onUploadCallback();let f;if(c instanceof Float32Array)f=i.FLOAT;else if(typeof Float16Array<"u"&&c instanceof Float16Array)f=i.HALF_FLOAT;else if(c instanceof Uint16Array)o.isFloat16BufferAttribute?f=i.HALF_FLOAT:f=i.UNSIGNED_SHORT;else if(c instanceof Int16Array)f=i.SHORT;else if(c instanceof Uint32Array)f=i.UNSIGNED_INT;else if(c instanceof Int32Array)f=i.INT;else if(c instanceof Int8Array)f=i.BYTE;else if(c instanceof Uint8Array)f=i.UNSIGNED_BYTE;else if(c instanceof Uint8ClampedArray)f=i.UNSIGNED_BYTE;else throw new Error("THREE.WebGLAttributes: Unsupported buffer data format: "+c);return{buffer:d,type:f,bytesPerElement:c.BYTES_PER_ELEMENT,version:o.version,size:h}}function n(o,l,c){const u=l.array,h=l.updateRanges;if(i.bindBuffer(c,o),h.length===0)i.bufferSubData(c,0,u);else{h.sort((f,g)=>f.start-g.start);let d=0;for(let f=1;f<h.length;f++){const g=h[d],v=h[f];v.start<=g.start+g.count+1?g.count=Math.max(g.count,v.start+v.count-g.start):(++d,h[d]=v)}h.length=d+1;for(let f=0,g=h.length;f<g;f++){const v=h[f];i.bufferSubData(c,v.start*u.BYTES_PER_ELEMENT,u,v.start,v.count)}l.clearUpdateRanges()}l.onUploadCallback()}function s(o){return o.isInterleavedBufferAttribute&&(o=o.data),t.get(o)}function r(o){o.isInterleavedBufferAttribute&&(o=o.data);const l=t.get(o);l&&(i.deleteBuffer(l.buffer),t.delete(o))}function a(o,l){if(o.isInterleavedBufferAttribute&&(o=o.data),o.isGLBufferAttribute){const u=t.get(o);(!u||u.version<o.version)&&t.set(o,{buffer:o.buffer,type:o.type,bytesPerElement:o.elementSize,version:o.version});return}const c=t.get(o);if(c===void 0)t.set(o,e(o,l));else if(c.version<o.version){if(c.size!==o.array.byteLength)throw new Error("THREE.WebGLAttributes: The size of the buffer attribute's array buffer does not match the original size. Resizing buffer attributes is not supported.");n(c.buffer,o,l),c.version=o.version}}return{get:s,remove:r,update:a}}var sm=`#ifdef USE_ALPHAHASH
	if ( diffuseColor.a < getAlphaHashThreshold( vPosition ) ) discard;
#endif`,rm=`#ifdef USE_ALPHAHASH
	const float ALPHA_HASH_SCALE = 0.05;
	float hash2D( vec2 value ) {
		return fract( 1.0e4 * sin( 17.0 * value.x + 0.1 * value.y ) * ( 0.1 + abs( sin( 13.0 * value.y + value.x ) ) ) );
	}
	float hash3D( vec3 value ) {
		return hash2D( vec2( hash2D( value.xy ), value.z ) );
	}
	float getAlphaHashThreshold( vec3 position ) {
		float maxDeriv = max(
			length( dFdx( position.xyz ) ),
			length( dFdy( position.xyz ) )
		);
		float pixScale = 1.0 / ( ALPHA_HASH_SCALE * maxDeriv );
		vec2 pixScales = vec2(
			exp2( floor( log2( pixScale ) ) ),
			exp2( ceil( log2( pixScale ) ) )
		);
		vec2 alpha = vec2(
			hash3D( floor( pixScales.x * position.xyz ) ),
			hash3D( floor( pixScales.y * position.xyz ) )
		);
		float lerpFactor = fract( log2( pixScale ) );
		float x = ( 1.0 - lerpFactor ) * alpha.x + lerpFactor * alpha.y;
		float a = min( lerpFactor, 1.0 - lerpFactor );
		vec3 cases = vec3(
			x * x / ( 2.0 * a * ( 1.0 - a ) ),
			( x - 0.5 * a ) / ( 1.0 - a ),
			1.0 - ( ( 1.0 - x ) * ( 1.0 - x ) / ( 2.0 * a * ( 1.0 - a ) ) )
		);
		float threshold = ( x < ( 1.0 - a ) )
			? ( ( x < a ) ? cases.x : cases.y )
			: cases.z;
		return clamp( threshold , 1.0e-6, 1.0 );
	}
#endif`,am=`#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, vAlphaMapUv ).g;
#endif`,om=`#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,lm=`#ifdef USE_ALPHATEST
	#ifdef ALPHA_TO_COVERAGE
	diffuseColor.a = smoothstep( alphaTest, alphaTest + fwidth( diffuseColor.a ), diffuseColor.a );
	if ( diffuseColor.a == 0.0 ) discard;
	#else
	if ( diffuseColor.a < alphaTest ) discard;
	#endif
#endif`,cm=`#ifdef USE_ALPHATEST
	uniform float alphaTest;
#endif`,hm=`#ifdef USE_AOMAP
	float ambientOcclusion = ( texture2D( aoMap, vAoMapUv ).r - 1.0 ) * aoMapIntensity + 1.0;
	reflectedLight.indirectDiffuse *= ambientOcclusion;
	#if defined( USE_CLEARCOAT ) 
		clearcoatSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_SHEEN ) 
		sheenSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_ENVMAP ) && defined( STANDARD )
		float dotNV = saturate( dot( geometryNormal, geometryViewDir ) );
		reflectedLight.indirectSpecular *= computeSpecularOcclusion( dotNV, ambientOcclusion, material.roughness );
	#endif
#endif`,um=`#ifdef USE_AOMAP
	uniform sampler2D aoMap;
	uniform float aoMapIntensity;
#endif`,dm=`#ifdef USE_BATCHING
	#if ! defined( GL_ANGLE_multi_draw )
	#define gl_DrawID _gl_DrawID
	uniform int _gl_DrawID;
	#endif
	uniform highp sampler2D batchingTexture;
	uniform highp usampler2D batchingIdTexture;
	mat4 getBatchingMatrix( const in float i ) {
		int size = textureSize( batchingTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( batchingTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( batchingTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( batchingTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( batchingTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
	float getIndirectIndex( const in int i ) {
		int size = textureSize( batchingIdTexture, 0 ).x;
		int x = i % size;
		int y = i / size;
		return float( texelFetch( batchingIdTexture, ivec2( x, y ), 0 ).r );
	}
#endif
#ifdef USE_BATCHING_COLOR
	uniform sampler2D batchingColorTexture;
	vec3 getBatchingColor( const in float i ) {
		int size = textureSize( batchingColorTexture, 0 ).x;
		int j = int( i );
		int x = j % size;
		int y = j / size;
		return texelFetch( batchingColorTexture, ivec2( x, y ), 0 ).rgb;
	}
#endif`,fm=`#ifdef USE_BATCHING
	mat4 batchingMatrix = getBatchingMatrix( getIndirectIndex( gl_DrawID ) );
#endif`,pm=`vec3 transformed = vec3( position );
#ifdef USE_ALPHAHASH
	vPosition = vec3( position );
#endif`,mm=`vec3 objectNormal = vec3( normal );
#ifdef USE_TANGENT
	vec3 objectTangent = vec3( tangent.xyz );
#endif`,gm=`float G_BlinnPhong_Implicit( ) {
	return 0.25;
}
float D_BlinnPhong( const in float shininess, const in float dotNH ) {
	return RECIPROCAL_PI * ( shininess * 0.5 + 1.0 ) * pow( dotNH, shininess );
}
vec3 BRDF_BlinnPhong( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in vec3 specularColor, const in float shininess ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( specularColor, 1.0, dotVH );
	float G = G_BlinnPhong_Implicit( );
	float D = D_BlinnPhong( shininess, dotNH );
	return F * ( G * D );
} // validated`,vm=`#ifdef USE_IRIDESCENCE
	const mat3 XYZ_TO_REC709 = mat3(
		 3.2404542, -0.9692660,  0.0556434,
		-1.5371385,  1.8760108, -0.2040259,
		-0.4985314,  0.0415560,  1.0572252
	);
	vec3 Fresnel0ToIor( vec3 fresnel0 ) {
		vec3 sqrtF0 = sqrt( fresnel0 );
		return ( vec3( 1.0 ) + sqrtF0 ) / ( vec3( 1.0 ) - sqrtF0 );
	}
	vec3 IorToFresnel0( vec3 transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - vec3( incidentIor ) ) / ( transmittedIor + vec3( incidentIor ) ) );
	}
	float IorToFresnel0( float transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - incidentIor ) / ( transmittedIor + incidentIor ));
	}
	vec3 evalSensitivity( float OPD, vec3 shift ) {
		float phase = 2.0 * PI * OPD * 1.0e-9;
		vec3 val = vec3( 5.4856e-13, 4.4201e-13, 5.2481e-13 );
		vec3 pos = vec3( 1.6810e+06, 1.7953e+06, 2.2084e+06 );
		vec3 var = vec3( 4.3278e+09, 9.3046e+09, 6.6121e+09 );
		vec3 xyz = val * sqrt( 2.0 * PI * var ) * cos( pos * phase + shift ) * exp( - pow2( phase ) * var );
		xyz.x += 9.7470e-14 * sqrt( 2.0 * PI * 4.5282e+09 ) * cos( 2.2399e+06 * phase + shift[ 0 ] ) * exp( - 4.5282e+09 * pow2( phase ) );
		xyz /= 1.0685e-7;
		vec3 rgb = XYZ_TO_REC709 * xyz;
		return rgb;
	}
	vec3 evalIridescence( float outsideIOR, float eta2, float cosTheta1, float thinFilmThickness, vec3 baseF0 ) {
		vec3 I;
		float iridescenceIOR = mix( outsideIOR, eta2, smoothstep( 0.0, 0.03, thinFilmThickness ) );
		float sinTheta2Sq = pow2( outsideIOR / iridescenceIOR ) * ( 1.0 - pow2( cosTheta1 ) );
		float cosTheta2Sq = 1.0 - sinTheta2Sq;
		if ( cosTheta2Sq < 0.0 ) {
			return vec3( 1.0 );
		}
		float cosTheta2 = sqrt( cosTheta2Sq );
		float R0 = IorToFresnel0( iridescenceIOR, outsideIOR );
		float R12 = F_Schlick( R0, 1.0, cosTheta1 );
		float T121 = 1.0 - R12;
		float phi12 = 0.0;
		if ( iridescenceIOR < outsideIOR ) phi12 = PI;
		float phi21 = PI - phi12;
		vec3 baseIOR = Fresnel0ToIor( clamp( baseF0, 0.0, 0.9999 ) );		vec3 R1 = IorToFresnel0( baseIOR, iridescenceIOR );
		vec3 R23 = F_Schlick( R1, 1.0, cosTheta2 );
		vec3 phi23 = vec3( 0.0 );
		if ( baseIOR[ 0 ] < iridescenceIOR ) phi23[ 0 ] = PI;
		if ( baseIOR[ 1 ] < iridescenceIOR ) phi23[ 1 ] = PI;
		if ( baseIOR[ 2 ] < iridescenceIOR ) phi23[ 2 ] = PI;
		float OPD = 2.0 * iridescenceIOR * thinFilmThickness * cosTheta2;
		vec3 phi = vec3( phi21 ) + phi23;
		vec3 R123 = clamp( R12 * R23, 1e-5, 0.9999 );
		vec3 r123 = sqrt( R123 );
		vec3 Rs = pow2( T121 ) * R23 / ( vec3( 1.0 ) - R123 );
		vec3 C0 = R12 + Rs;
		I = C0;
		vec3 Cm = Rs - T121;
		for ( int m = 1; m <= 2; ++ m ) {
			Cm *= r123;
			vec3 Sm = 2.0 * evalSensitivity( float( m ) * OPD, float( m ) * phi );
			I += Cm * Sm;
		}
		return max( I, vec3( 0.0 ) );
	}
#endif`,Sm=`#ifdef USE_BUMPMAP
	uniform sampler2D bumpMap;
	uniform float bumpScale;
	vec2 dHdxy_fwd() {
		vec2 dSTdx = dFdx( vBumpMapUv );
		vec2 dSTdy = dFdy( vBumpMapUv );
		float Hll = bumpScale * texture2D( bumpMap, vBumpMapUv ).x;
		float dBx = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdx ).x - Hll;
		float dBy = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdy ).x - Hll;
		return vec2( dBx, dBy );
	}
	vec3 perturbNormalArb( vec3 surf_pos, vec3 surf_norm, vec2 dHdxy, float faceDirection ) {
		vec3 vSigmaX = normalize( dFdx( surf_pos.xyz ) );
		vec3 vSigmaY = normalize( dFdy( surf_pos.xyz ) );
		vec3 vN = surf_norm;
		vec3 R1 = cross( vSigmaY, vN );
		vec3 R2 = cross( vN, vSigmaX );
		float fDet = dot( vSigmaX, R1 ) * faceDirection;
		vec3 vGrad = sign( fDet ) * ( dHdxy.x * R1 + dHdxy.y * R2 );
		return normalize( abs( fDet ) * surf_norm - vGrad );
	}
#endif`,xm=`#if NUM_CLIPPING_PLANES > 0
	vec4 plane;
	#ifdef ALPHA_TO_COVERAGE
		float distanceToPlane, distanceGradient;
		float clipOpacity = 1.0;
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
			distanceGradient = fwidth( distanceToPlane ) / 2.0;
			clipOpacity *= smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			if ( clipOpacity == 0.0 ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			float unionClipOpacity = 1.0;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
				distanceGradient = fwidth( distanceToPlane ) / 2.0;
				unionClipOpacity *= 1.0 - smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			}
			#pragma unroll_loop_end
			clipOpacity *= 1.0 - unionClipOpacity;
		#endif
		diffuseColor.a *= clipOpacity;
		if ( diffuseColor.a == 0.0 ) discard;
	#else
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			if ( dot( vClipPosition, plane.xyz ) > plane.w ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			bool clipped = true;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				clipped = ( dot( vClipPosition, plane.xyz ) > plane.w ) && clipped;
			}
			#pragma unroll_loop_end
			if ( clipped ) discard;
		#endif
	#endif
#endif`,_m=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];
#endif`,ym=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
#endif`,Mm=`#if NUM_CLIPPING_PLANES > 0
	vClipPosition = - mvPosition.xyz;
#endif`,bm=`#if defined( USE_COLOR_ALPHA )
	diffuseColor *= vColor;
#elif defined( USE_COLOR )
	diffuseColor.rgb *= vColor;
#endif`,Rm=`#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR )
	varying vec3 vColor;
#endif`,wm=`#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	varying vec3 vColor;
#endif`,Em=`#if defined( USE_COLOR_ALPHA )
	vColor = vec4( 1.0 );
#elif defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	vColor = vec3( 1.0 );
#endif
#ifdef USE_COLOR
	vColor *= color;
#endif
#ifdef USE_INSTANCING_COLOR
	vColor.xyz *= instanceColor.xyz;
#endif
#ifdef USE_BATCHING_COLOR
	vec3 batchingColor = getBatchingColor( getIndirectIndex( gl_DrawID ) );
	vColor.xyz *= batchingColor.xyz;
#endif`,Tm=`#define PI 3.141592653589793
#define PI2 6.283185307179586
#define PI_HALF 1.5707963267948966
#define RECIPROCAL_PI 0.3183098861837907
#define RECIPROCAL_PI2 0.15915494309189535
#define EPSILON 1e-6
#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
#define whiteComplement( a ) ( 1.0 - saturate( a ) )
float pow2( const in float x ) { return x*x; }
vec3 pow2( const in vec3 x ) { return x*x; }
float pow3( const in float x ) { return x*x*x; }
float pow4( const in float x ) { float x2 = x*x; return x2*x2; }
float max3( const in vec3 v ) { return max( max( v.x, v.y ), v.z ); }
float average( const in vec3 v ) { return dot( v, vec3( 0.3333333 ) ); }
highp float rand( const in vec2 uv ) {
	const highp float a = 12.9898, b = 78.233, c = 43758.5453;
	highp float dt = dot( uv.xy, vec2( a,b ) ), sn = mod( dt, PI );
	return fract( sin( sn ) * c );
}
#ifdef HIGH_PRECISION
	float precisionSafeLength( vec3 v ) { return length( v ); }
#else
	float precisionSafeLength( vec3 v ) {
		float maxComponent = max3( abs( v ) );
		return length( v / maxComponent ) * maxComponent;
	}
#endif
struct IncidentLight {
	vec3 color;
	vec3 direction;
	bool visible;
};
struct ReflectedLight {
	vec3 directDiffuse;
	vec3 directSpecular;
	vec3 indirectDiffuse;
	vec3 indirectSpecular;
};
#ifdef USE_ALPHAHASH
	varying vec3 vPosition;
#endif
vec3 transformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );
}
vec3 inverseTransformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( vec4( dir, 0.0 ) * matrix ).xyz );
}
mat3 transposeMat3( const in mat3 m ) {
	mat3 tmp;
	tmp[ 0 ] = vec3( m[ 0 ].x, m[ 1 ].x, m[ 2 ].x );
	tmp[ 1 ] = vec3( m[ 0 ].y, m[ 1 ].y, m[ 2 ].y );
	tmp[ 2 ] = vec3( m[ 0 ].z, m[ 1 ].z, m[ 2 ].z );
	return tmp;
}
bool isPerspectiveMatrix( mat4 m ) {
	return m[ 2 ][ 3 ] == - 1.0;
}
vec2 equirectUv( in vec3 dir ) {
	float u = atan( dir.z, dir.x ) * RECIPROCAL_PI2 + 0.5;
	float v = asin( clamp( dir.y, - 1.0, 1.0 ) ) * RECIPROCAL_PI + 0.5;
	return vec2( u, v );
}
vec3 BRDF_Lambert( const in vec3 diffuseColor ) {
	return RECIPROCAL_PI * diffuseColor;
}
vec3 F_Schlick( const in vec3 f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
}
float F_Schlick( const in float f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
} // validated`,Cm=`#ifdef ENVMAP_TYPE_CUBE_UV
	#define cubeUV_minMipLevel 4.0
	#define cubeUV_minTileSize 16.0
	float getFace( vec3 direction ) {
		vec3 absDirection = abs( direction );
		float face = - 1.0;
		if ( absDirection.x > absDirection.z ) {
			if ( absDirection.x > absDirection.y )
				face = direction.x > 0.0 ? 0.0 : 3.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		} else {
			if ( absDirection.z > absDirection.y )
				face = direction.z > 0.0 ? 2.0 : 5.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		}
		return face;
	}
	vec2 getUV( vec3 direction, float face ) {
		vec2 uv;
		if ( face == 0.0 ) {
			uv = vec2( direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 1.0 ) {
			uv = vec2( - direction.x, - direction.z ) / abs( direction.y );
		} else if ( face == 2.0 ) {
			uv = vec2( - direction.x, direction.y ) / abs( direction.z );
		} else if ( face == 3.0 ) {
			uv = vec2( - direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 4.0 ) {
			uv = vec2( - direction.x, direction.z ) / abs( direction.y );
		} else {
			uv = vec2( direction.x, direction.y ) / abs( direction.z );
		}
		return 0.5 * ( uv + 1.0 );
	}
	vec3 bilinearCubeUV( sampler2D envMap, vec3 direction, float mipInt ) {
		float face = getFace( direction );
		float filterInt = max( cubeUV_minMipLevel - mipInt, 0.0 );
		mipInt = max( mipInt, cubeUV_minMipLevel );
		float faceSize = exp2( mipInt );
		highp vec2 uv = getUV( direction, face ) * ( faceSize - 2.0 ) + 1.0;
		if ( face > 2.0 ) {
			uv.y += faceSize;
			face -= 3.0;
		}
		uv.x += face * faceSize;
		uv.x += filterInt * 3.0 * cubeUV_minTileSize;
		uv.y += 4.0 * ( exp2( CUBEUV_MAX_MIP ) - faceSize );
		uv.x *= CUBEUV_TEXEL_WIDTH;
		uv.y *= CUBEUV_TEXEL_HEIGHT;
		#ifdef texture2DGradEXT
			return texture2DGradEXT( envMap, uv, vec2( 0.0 ), vec2( 0.0 ) ).rgb;
		#else
			return texture2D( envMap, uv ).rgb;
		#endif
	}
	#define cubeUV_r0 1.0
	#define cubeUV_m0 - 2.0
	#define cubeUV_r1 0.8
	#define cubeUV_m1 - 1.0
	#define cubeUV_r4 0.4
	#define cubeUV_m4 2.0
	#define cubeUV_r5 0.305
	#define cubeUV_m5 3.0
	#define cubeUV_r6 0.21
	#define cubeUV_m6 4.0
	float roughnessToMip( float roughness ) {
		float mip = 0.0;
		if ( roughness >= cubeUV_r1 ) {
			mip = ( cubeUV_r0 - roughness ) * ( cubeUV_m1 - cubeUV_m0 ) / ( cubeUV_r0 - cubeUV_r1 ) + cubeUV_m0;
		} else if ( roughness >= cubeUV_r4 ) {
			mip = ( cubeUV_r1 - roughness ) * ( cubeUV_m4 - cubeUV_m1 ) / ( cubeUV_r1 - cubeUV_r4 ) + cubeUV_m1;
		} else if ( roughness >= cubeUV_r5 ) {
			mip = ( cubeUV_r4 - roughness ) * ( cubeUV_m5 - cubeUV_m4 ) / ( cubeUV_r4 - cubeUV_r5 ) + cubeUV_m4;
		} else if ( roughness >= cubeUV_r6 ) {
			mip = ( cubeUV_r5 - roughness ) * ( cubeUV_m6 - cubeUV_m5 ) / ( cubeUV_r5 - cubeUV_r6 ) + cubeUV_m5;
		} else {
			mip = - 2.0 * log2( 1.16 * roughness );		}
		return mip;
	}
	vec4 textureCubeUV( sampler2D envMap, vec3 sampleDir, float roughness ) {
		float mip = clamp( roughnessToMip( roughness ), cubeUV_m0, CUBEUV_MAX_MIP );
		float mipF = fract( mip );
		float mipInt = floor( mip );
		vec3 color0 = bilinearCubeUV( envMap, sampleDir, mipInt );
		if ( mipF == 0.0 ) {
			return vec4( color0, 1.0 );
		} else {
			vec3 color1 = bilinearCubeUV( envMap, sampleDir, mipInt + 1.0 );
			return vec4( mix( color0, color1, mipF ), 1.0 );
		}
	}
#endif`,Am=`vec3 transformedNormal = objectNormal;
#ifdef USE_TANGENT
	vec3 transformedTangent = objectTangent;
#endif
#ifdef USE_BATCHING
	mat3 bm = mat3( batchingMatrix );
	transformedNormal /= vec3( dot( bm[ 0 ], bm[ 0 ] ), dot( bm[ 1 ], bm[ 1 ] ), dot( bm[ 2 ], bm[ 2 ] ) );
	transformedNormal = bm * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = bm * transformedTangent;
	#endif
#endif
#ifdef USE_INSTANCING
	mat3 im = mat3( instanceMatrix );
	transformedNormal /= vec3( dot( im[ 0 ], im[ 0 ] ), dot( im[ 1 ], im[ 1 ] ), dot( im[ 2 ], im[ 2 ] ) );
	transformedNormal = im * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = im * transformedTangent;
	#endif
#endif
transformedNormal = normalMatrix * transformedNormal;
#ifdef FLIP_SIDED
	transformedNormal = - transformedNormal;
#endif
#ifdef USE_TANGENT
	transformedTangent = ( modelViewMatrix * vec4( transformedTangent, 0.0 ) ).xyz;
	#ifdef FLIP_SIDED
		transformedTangent = - transformedTangent;
	#endif
#endif`,Lm=`#ifdef USE_DISPLACEMENTMAP
	uniform sampler2D displacementMap;
	uniform float displacementScale;
	uniform float displacementBias;
#endif`,Pm=`#ifdef USE_DISPLACEMENTMAP
	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vDisplacementMapUv ).x * displacementScale + displacementBias );
#endif`,Fm=`#ifdef USE_EMISSIVEMAP
	vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );
	#ifdef DECODE_VIDEO_TEXTURE_EMISSIVE
		emissiveColor = sRGBTransferEOTF( emissiveColor );
	#endif
	totalEmissiveRadiance *= emissiveColor.rgb;
#endif`,Im=`#ifdef USE_EMISSIVEMAP
	uniform sampler2D emissiveMap;
#endif`,Dm="gl_FragColor = linearToOutputTexel( gl_FragColor );",Bm=`vec4 LinearTransferOETF( in vec4 value ) {
	return value;
}
vec4 sRGBTransferEOTF( in vec4 value ) {
	return vec4( mix( pow( value.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), value.rgb * 0.0773993808, vec3( lessThanEqual( value.rgb, vec3( 0.04045 ) ) ) ), value.a );
}
vec4 sRGBTransferOETF( in vec4 value ) {
	return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );
}`,Um=`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vec3 cameraToFrag;
		if ( isOrthographic ) {
			cameraToFrag = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToFrag = normalize( vWorldPosition - cameraPosition );
		}
		vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vec3 reflectVec = reflect( cameraToFrag, worldNormal );
		#else
			vec3 reflectVec = refract( cameraToFrag, worldNormal, refractionRatio );
		#endif
	#else
		vec3 reflectVec = vReflect;
	#endif
	#ifdef ENVMAP_TYPE_CUBE
		vec4 envColor = textureCube( envMap, envMapRotation * vec3( flipEnvMap * reflectVec.x, reflectVec.yz ) );
	#else
		vec4 envColor = vec4( 0.0 );
	#endif
	#ifdef ENVMAP_BLENDING_MULTIPLY
		outgoingLight = mix( outgoingLight, outgoingLight * envColor.xyz, specularStrength * reflectivity );
	#elif defined( ENVMAP_BLENDING_MIX )
		outgoingLight = mix( outgoingLight, envColor.xyz, specularStrength * reflectivity );
	#elif defined( ENVMAP_BLENDING_ADD )
		outgoingLight += envColor.xyz * specularStrength * reflectivity;
	#endif
#endif`,Nm=`#ifdef USE_ENVMAP
	uniform float envMapIntensity;
	uniform float flipEnvMap;
	uniform mat3 envMapRotation;
	#ifdef ENVMAP_TYPE_CUBE
		uniform samplerCube envMap;
	#else
		uniform sampler2D envMap;
	#endif
	
#endif`,Om=`#ifdef USE_ENVMAP
	uniform float reflectivity;
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		varying vec3 vWorldPosition;
		uniform float refractionRatio;
	#else
		varying vec3 vReflect;
	#endif
#endif`,zm=`#ifdef USE_ENVMAP
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		
		varying vec3 vWorldPosition;
	#else
		varying vec3 vReflect;
		uniform float refractionRatio;
	#endif
#endif`,km=`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vWorldPosition = worldPosition.xyz;
	#else
		vec3 cameraToVertex;
		if ( isOrthographic ) {
			cameraToVertex = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToVertex = normalize( worldPosition.xyz - cameraPosition );
		}
		vec3 worldNormal = inverseTransformDirection( transformedNormal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vReflect = reflect( cameraToVertex, worldNormal );
		#else
			vReflect = refract( cameraToVertex, worldNormal, refractionRatio );
		#endif
	#endif
#endif`,Hm=`#ifdef USE_FOG
	vFogDepth = - mvPosition.z;
#endif`,Gm=`#ifdef USE_FOG
	varying float vFogDepth;
#endif`,Vm=`#ifdef USE_FOG
	#ifdef FOG_EXP2
		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
	#endif
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif`,Wm=`#ifdef USE_FOG
	uniform vec3 fogColor;
	varying float vFogDepth;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
#endif`,$m=`#ifdef USE_GRADIENTMAP
	uniform sampler2D gradientMap;
#endif
vec3 getGradientIrradiance( vec3 normal, vec3 lightDirection ) {
	float dotNL = dot( normal, lightDirection );
	vec2 coord = vec2( dotNL * 0.5 + 0.5, 0.0 );
	#ifdef USE_GRADIENTMAP
		return vec3( texture2D( gradientMap, coord ).r );
	#else
		vec2 fw = fwidth( coord ) * 0.5;
		return mix( vec3( 0.7 ), vec3( 1.0 ), smoothstep( 0.7 - fw.x, 0.7 + fw.x, coord.x ) );
	#endif
}`,Xm=`#ifdef USE_LIGHTMAP
	uniform sampler2D lightMap;
	uniform float lightMapIntensity;
#endif`,qm=`LambertMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularStrength = specularStrength;`,Ym=`varying vec3 vViewPosition;
struct LambertMaterial {
	vec3 diffuseColor;
	float specularStrength;
};
void RE_Direct_Lambert( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Lambert( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Lambert
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Lambert`,Jm=`uniform bool receiveShadow;
uniform vec3 ambientLightColor;
#if defined( USE_LIGHT_PROBES )
	uniform vec3 lightProbe[ 9 ];
#endif
vec3 shGetIrradianceAt( in vec3 normal, in vec3 shCoefficients[ 9 ] ) {
	float x = normal.x, y = normal.y, z = normal.z;
	vec3 result = shCoefficients[ 0 ] * 0.886227;
	result += shCoefficients[ 1 ] * 2.0 * 0.511664 * y;
	result += shCoefficients[ 2 ] * 2.0 * 0.511664 * z;
	result += shCoefficients[ 3 ] * 2.0 * 0.511664 * x;
	result += shCoefficients[ 4 ] * 2.0 * 0.429043 * x * y;
	result += shCoefficients[ 5 ] * 2.0 * 0.429043 * y * z;
	result += shCoefficients[ 6 ] * ( 0.743125 * z * z - 0.247708 );
	result += shCoefficients[ 7 ] * 2.0 * 0.429043 * x * z;
	result += shCoefficients[ 8 ] * 0.429043 * ( x * x - y * y );
	return result;
}
vec3 getLightProbeIrradiance( const in vec3 lightProbe[ 9 ], const in vec3 normal ) {
	vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
	vec3 irradiance = shGetIrradianceAt( worldNormal, lightProbe );
	return irradiance;
}
vec3 getAmbientLightIrradiance( const in vec3 ambientLightColor ) {
	vec3 irradiance = ambientLightColor;
	return irradiance;
}
float getDistanceAttenuation( const in float lightDistance, const in float cutoffDistance, const in float decayExponent ) {
	float distanceFalloff = 1.0 / max( pow( lightDistance, decayExponent ), 0.01 );
	if ( cutoffDistance > 0.0 ) {
		distanceFalloff *= pow2( saturate( 1.0 - pow4( lightDistance / cutoffDistance ) ) );
	}
	return distanceFalloff;
}
float getSpotAttenuation( const in float coneCosine, const in float penumbraCosine, const in float angleCosine ) {
	return smoothstep( coneCosine, penumbraCosine, angleCosine );
}
#if NUM_DIR_LIGHTS > 0
	struct DirectionalLight {
		vec3 direction;
		vec3 color;
	};
	uniform DirectionalLight directionalLights[ NUM_DIR_LIGHTS ];
	void getDirectionalLightInfo( const in DirectionalLight directionalLight, out IncidentLight light ) {
		light.color = directionalLight.color;
		light.direction = directionalLight.direction;
		light.visible = true;
	}
#endif
#if NUM_POINT_LIGHTS > 0
	struct PointLight {
		vec3 position;
		vec3 color;
		float distance;
		float decay;
	};
	uniform PointLight pointLights[ NUM_POINT_LIGHTS ];
	void getPointLightInfo( const in PointLight pointLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = pointLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float lightDistance = length( lVector );
		light.color = pointLight.color;
		light.color *= getDistanceAttenuation( lightDistance, pointLight.distance, pointLight.decay );
		light.visible = ( light.color != vec3( 0.0 ) );
	}
#endif
#if NUM_SPOT_LIGHTS > 0
	struct SpotLight {
		vec3 position;
		vec3 direction;
		vec3 color;
		float distance;
		float decay;
		float coneCos;
		float penumbraCos;
	};
	uniform SpotLight spotLights[ NUM_SPOT_LIGHTS ];
	void getSpotLightInfo( const in SpotLight spotLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = spotLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float angleCos = dot( light.direction, spotLight.direction );
		float spotAttenuation = getSpotAttenuation( spotLight.coneCos, spotLight.penumbraCos, angleCos );
		if ( spotAttenuation > 0.0 ) {
			float lightDistance = length( lVector );
			light.color = spotLight.color * spotAttenuation;
			light.color *= getDistanceAttenuation( lightDistance, spotLight.distance, spotLight.decay );
			light.visible = ( light.color != vec3( 0.0 ) );
		} else {
			light.color = vec3( 0.0 );
			light.visible = false;
		}
	}
#endif
#if NUM_RECT_AREA_LIGHTS > 0
	struct RectAreaLight {
		vec3 color;
		vec3 position;
		vec3 halfWidth;
		vec3 halfHeight;
	};
	uniform sampler2D ltc_1;	uniform sampler2D ltc_2;
	uniform RectAreaLight rectAreaLights[ NUM_RECT_AREA_LIGHTS ];
#endif
#if NUM_HEMI_LIGHTS > 0
	struct HemisphereLight {
		vec3 direction;
		vec3 skyColor;
		vec3 groundColor;
	};
	uniform HemisphereLight hemisphereLights[ NUM_HEMI_LIGHTS ];
	vec3 getHemisphereLightIrradiance( const in HemisphereLight hemiLight, const in vec3 normal ) {
		float dotNL = dot( normal, hemiLight.direction );
		float hemiDiffuseWeight = 0.5 * dotNL + 0.5;
		vec3 irradiance = mix( hemiLight.groundColor, hemiLight.skyColor, hemiDiffuseWeight );
		return irradiance;
	}
#endif`,Km=`#ifdef USE_ENVMAP
	vec3 getIBLIrradiance( const in vec3 normal ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * worldNormal, 1.0 );
			return PI * envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	vec3 getIBLRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 reflectVec = reflect( - viewDir, normal );
			reflectVec = normalize( mix( reflectVec, normal, roughness * roughness) );
			reflectVec = inverseTransformDirection( reflectVec, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * reflectVec, roughness );
			return envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	#ifdef USE_ANISOTROPY
		vec3 getIBLAnisotropyRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness, const in vec3 bitangent, const in float anisotropy ) {
			#ifdef ENVMAP_TYPE_CUBE_UV
				vec3 bentNormal = cross( bitangent, viewDir );
				bentNormal = normalize( cross( bentNormal, bitangent ) );
				bentNormal = normalize( mix( bentNormal, normal, pow2( pow2( 1.0 - anisotropy * ( 1.0 - roughness ) ) ) ) );
				return getIBLRadiance( viewDir, bentNormal, roughness );
			#else
				return vec3( 0.0 );
			#endif
		}
	#endif
#endif`,Zm=`ToonMaterial material;
material.diffuseColor = diffuseColor.rgb;`,jm=`varying vec3 vViewPosition;
struct ToonMaterial {
	vec3 diffuseColor;
};
void RE_Direct_Toon( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	vec3 irradiance = getGradientIrradiance( geometryNormal, directLight.direction ) * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Toon( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Toon
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Toon`,Qm=`BlinnPhongMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularColor = specular;
material.specularShininess = shininess;
material.specularStrength = specularStrength;`,t0=`varying vec3 vViewPosition;
struct BlinnPhongMaterial {
	vec3 diffuseColor;
	vec3 specularColor;
	float specularShininess;
	float specularStrength;
};
void RE_Direct_BlinnPhong( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
	reflectedLight.directSpecular += irradiance * BRDF_BlinnPhong( directLight.direction, geometryViewDir, geometryNormal, material.specularColor, material.specularShininess ) * material.specularStrength;
}
void RE_IndirectDiffuse_BlinnPhong( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_BlinnPhong
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong`,e0=`PhysicalMaterial material;
material.diffuseColor = diffuseColor.rgb * ( 1.0 - metalnessFactor );
vec3 dxy = max( abs( dFdx( nonPerturbedNormal ) ), abs( dFdy( nonPerturbedNormal ) ) );
float geometryRoughness = max( max( dxy.x, dxy.y ), dxy.z );
material.roughness = max( roughnessFactor, 0.0525 );material.roughness += geometryRoughness;
material.roughness = min( material.roughness, 1.0 );
#ifdef IOR
	material.ior = ior;
	#ifdef USE_SPECULAR
		float specularIntensityFactor = specularIntensity;
		vec3 specularColorFactor = specularColor;
		#ifdef USE_SPECULAR_COLORMAP
			specularColorFactor *= texture2D( specularColorMap, vSpecularColorMapUv ).rgb;
		#endif
		#ifdef USE_SPECULAR_INTENSITYMAP
			specularIntensityFactor *= texture2D( specularIntensityMap, vSpecularIntensityMapUv ).a;
		#endif
		material.specularF90 = mix( specularIntensityFactor, 1.0, metalnessFactor );
	#else
		float specularIntensityFactor = 1.0;
		vec3 specularColorFactor = vec3( 1.0 );
		material.specularF90 = 1.0;
	#endif
	material.specularColor = mix( min( pow2( ( material.ior - 1.0 ) / ( material.ior + 1.0 ) ) * specularColorFactor, vec3( 1.0 ) ) * specularIntensityFactor, diffuseColor.rgb, metalnessFactor );
#else
	material.specularColor = mix( vec3( 0.04 ), diffuseColor.rgb, metalnessFactor );
	material.specularF90 = 1.0;
#endif
#ifdef USE_CLEARCOAT
	material.clearcoat = clearcoat;
	material.clearcoatRoughness = clearcoatRoughness;
	material.clearcoatF0 = vec3( 0.04 );
	material.clearcoatF90 = 1.0;
	#ifdef USE_CLEARCOATMAP
		material.clearcoat *= texture2D( clearcoatMap, vClearcoatMapUv ).x;
	#endif
	#ifdef USE_CLEARCOAT_ROUGHNESSMAP
		material.clearcoatRoughness *= texture2D( clearcoatRoughnessMap, vClearcoatRoughnessMapUv ).y;
	#endif
	material.clearcoat = saturate( material.clearcoat );	material.clearcoatRoughness = max( material.clearcoatRoughness, 0.0525 );
	material.clearcoatRoughness += geometryRoughness;
	material.clearcoatRoughness = min( material.clearcoatRoughness, 1.0 );
#endif
#ifdef USE_DISPERSION
	material.dispersion = dispersion;
#endif
#ifdef USE_IRIDESCENCE
	material.iridescence = iridescence;
	material.iridescenceIOR = iridescenceIOR;
	#ifdef USE_IRIDESCENCEMAP
		material.iridescence *= texture2D( iridescenceMap, vIridescenceMapUv ).r;
	#endif
	#ifdef USE_IRIDESCENCE_THICKNESSMAP
		material.iridescenceThickness = (iridescenceThicknessMaximum - iridescenceThicknessMinimum) * texture2D( iridescenceThicknessMap, vIridescenceThicknessMapUv ).g + iridescenceThicknessMinimum;
	#else
		material.iridescenceThickness = iridescenceThicknessMaximum;
	#endif
#endif
#ifdef USE_SHEEN
	material.sheenColor = sheenColor;
	#ifdef USE_SHEEN_COLORMAP
		material.sheenColor *= texture2D( sheenColorMap, vSheenColorMapUv ).rgb;
	#endif
	material.sheenRoughness = clamp( sheenRoughness, 0.07, 1.0 );
	#ifdef USE_SHEEN_ROUGHNESSMAP
		material.sheenRoughness *= texture2D( sheenRoughnessMap, vSheenRoughnessMapUv ).a;
	#endif
#endif
#ifdef USE_ANISOTROPY
	#ifdef USE_ANISOTROPYMAP
		mat2 anisotropyMat = mat2( anisotropyVector.x, anisotropyVector.y, - anisotropyVector.y, anisotropyVector.x );
		vec3 anisotropyPolar = texture2D( anisotropyMap, vAnisotropyMapUv ).rgb;
		vec2 anisotropyV = anisotropyMat * normalize( 2.0 * anisotropyPolar.rg - vec2( 1.0 ) ) * anisotropyPolar.b;
	#else
		vec2 anisotropyV = anisotropyVector;
	#endif
	material.anisotropy = length( anisotropyV );
	if( material.anisotropy == 0.0 ) {
		anisotropyV = vec2( 1.0, 0.0 );
	} else {
		anisotropyV /= material.anisotropy;
		material.anisotropy = saturate( material.anisotropy );
	}
	material.alphaT = mix( pow2( material.roughness ), 1.0, pow2( material.anisotropy ) );
	material.anisotropyT = tbn[ 0 ] * anisotropyV.x + tbn[ 1 ] * anisotropyV.y;
	material.anisotropyB = tbn[ 1 ] * anisotropyV.x - tbn[ 0 ] * anisotropyV.y;
#endif`,n0=`struct PhysicalMaterial {
	vec3 diffuseColor;
	float roughness;
	vec3 specularColor;
	float specularF90;
	float dispersion;
	#ifdef USE_CLEARCOAT
		float clearcoat;
		float clearcoatRoughness;
		vec3 clearcoatF0;
		float clearcoatF90;
	#endif
	#ifdef USE_IRIDESCENCE
		float iridescence;
		float iridescenceIOR;
		float iridescenceThickness;
		vec3 iridescenceFresnel;
		vec3 iridescenceF0;
	#endif
	#ifdef USE_SHEEN
		vec3 sheenColor;
		float sheenRoughness;
	#endif
	#ifdef IOR
		float ior;
	#endif
	#ifdef USE_TRANSMISSION
		float transmission;
		float transmissionAlpha;
		float thickness;
		float attenuationDistance;
		vec3 attenuationColor;
	#endif
	#ifdef USE_ANISOTROPY
		float anisotropy;
		float alphaT;
		vec3 anisotropyT;
		vec3 anisotropyB;
	#endif
};
vec3 clearcoatSpecularDirect = vec3( 0.0 );
vec3 clearcoatSpecularIndirect = vec3( 0.0 );
vec3 sheenSpecularDirect = vec3( 0.0 );
vec3 sheenSpecularIndirect = vec3(0.0 );
vec3 Schlick_to_F0( const in vec3 f, const in float f90, const in float dotVH ) {
    float x = clamp( 1.0 - dotVH, 0.0, 1.0 );
    float x2 = x * x;
    float x5 = clamp( x * x2 * x2, 0.0, 0.9999 );
    return ( f - vec3( f90 ) * x5 ) / ( 1.0 - x5 );
}
float V_GGX_SmithCorrelated( const in float alpha, const in float dotNL, const in float dotNV ) {
	float a2 = pow2( alpha );
	float gv = dotNL * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNV ) );
	float gl = dotNV * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNL ) );
	return 0.5 / max( gv + gl, EPSILON );
}
float D_GGX( const in float alpha, const in float dotNH ) {
	float a2 = pow2( alpha );
	float denom = pow2( dotNH ) * ( a2 - 1.0 ) + 1.0;
	return RECIPROCAL_PI * a2 / pow2( denom );
}
#ifdef USE_ANISOTROPY
	float V_GGX_SmithCorrelated_Anisotropic( const in float alphaT, const in float alphaB, const in float dotTV, const in float dotBV, const in float dotTL, const in float dotBL, const in float dotNV, const in float dotNL ) {
		float gv = dotNL * length( vec3( alphaT * dotTV, alphaB * dotBV, dotNV ) );
		float gl = dotNV * length( vec3( alphaT * dotTL, alphaB * dotBL, dotNL ) );
		float v = 0.5 / ( gv + gl );
		return saturate(v);
	}
	float D_GGX_Anisotropic( const in float alphaT, const in float alphaB, const in float dotNH, const in float dotTH, const in float dotBH ) {
		float a2 = alphaT * alphaB;
		highp vec3 v = vec3( alphaB * dotTH, alphaT * dotBH, a2 * dotNH );
		highp float v2 = dot( v, v );
		float w2 = a2 / v2;
		return RECIPROCAL_PI * a2 * pow2 ( w2 );
	}
#endif
#ifdef USE_CLEARCOAT
	vec3 BRDF_GGX_Clearcoat( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material) {
		vec3 f0 = material.clearcoatF0;
		float f90 = material.clearcoatF90;
		float roughness = material.clearcoatRoughness;
		float alpha = pow2( roughness );
		vec3 halfDir = normalize( lightDir + viewDir );
		float dotNL = saturate( dot( normal, lightDir ) );
		float dotNV = saturate( dot( normal, viewDir ) );
		float dotNH = saturate( dot( normal, halfDir ) );
		float dotVH = saturate( dot( viewDir, halfDir ) );
		vec3 F = F_Schlick( f0, f90, dotVH );
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
		return F * ( V * D );
	}
#endif
vec3 BRDF_GGX( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material ) {
	vec3 f0 = material.specularColor;
	float f90 = material.specularF90;
	float roughness = material.roughness;
	float alpha = pow2( roughness );
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( f0, f90, dotVH );
	#ifdef USE_IRIDESCENCE
		F = mix( F, material.iridescenceFresnel, material.iridescence );
	#endif
	#ifdef USE_ANISOTROPY
		float dotTL = dot( material.anisotropyT, lightDir );
		float dotTV = dot( material.anisotropyT, viewDir );
		float dotTH = dot( material.anisotropyT, halfDir );
		float dotBL = dot( material.anisotropyB, lightDir );
		float dotBV = dot( material.anisotropyB, viewDir );
		float dotBH = dot( material.anisotropyB, halfDir );
		float V = V_GGX_SmithCorrelated_Anisotropic( material.alphaT, alpha, dotTV, dotBV, dotTL, dotBL, dotNV, dotNL );
		float D = D_GGX_Anisotropic( material.alphaT, alpha, dotNH, dotTH, dotBH );
	#else
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
	#endif
	return F * ( V * D );
}
vec2 LTC_Uv( const in vec3 N, const in vec3 V, const in float roughness ) {
	const float LUT_SIZE = 64.0;
	const float LUT_SCALE = ( LUT_SIZE - 1.0 ) / LUT_SIZE;
	const float LUT_BIAS = 0.5 / LUT_SIZE;
	float dotNV = saturate( dot( N, V ) );
	vec2 uv = vec2( roughness, sqrt( 1.0 - dotNV ) );
	uv = uv * LUT_SCALE + LUT_BIAS;
	return uv;
}
float LTC_ClippedSphereFormFactor( const in vec3 f ) {
	float l = length( f );
	return max( ( l * l + f.z ) / ( l + 1.0 ), 0.0 );
}
vec3 LTC_EdgeVectorFormFactor( const in vec3 v1, const in vec3 v2 ) {
	float x = dot( v1, v2 );
	float y = abs( x );
	float a = 0.8543985 + ( 0.4965155 + 0.0145206 * y ) * y;
	float b = 3.4175940 + ( 4.1616724 + y ) * y;
	float v = a / b;
	float theta_sintheta = ( x > 0.0 ) ? v : 0.5 * inversesqrt( max( 1.0 - x * x, 1e-7 ) ) - v;
	return cross( v1, v2 ) * theta_sintheta;
}
vec3 LTC_Evaluate( const in vec3 N, const in vec3 V, const in vec3 P, const in mat3 mInv, const in vec3 rectCoords[ 4 ] ) {
	vec3 v1 = rectCoords[ 1 ] - rectCoords[ 0 ];
	vec3 v2 = rectCoords[ 3 ] - rectCoords[ 0 ];
	vec3 lightNormal = cross( v1, v2 );
	if( dot( lightNormal, P - rectCoords[ 0 ] ) < 0.0 ) return vec3( 0.0 );
	vec3 T1, T2;
	T1 = normalize( V - N * dot( V, N ) );
	T2 = - cross( N, T1 );
	mat3 mat = mInv * transposeMat3( mat3( T1, T2, N ) );
	vec3 coords[ 4 ];
	coords[ 0 ] = mat * ( rectCoords[ 0 ] - P );
	coords[ 1 ] = mat * ( rectCoords[ 1 ] - P );
	coords[ 2 ] = mat * ( rectCoords[ 2 ] - P );
	coords[ 3 ] = mat * ( rectCoords[ 3 ] - P );
	coords[ 0 ] = normalize( coords[ 0 ] );
	coords[ 1 ] = normalize( coords[ 1 ] );
	coords[ 2 ] = normalize( coords[ 2 ] );
	coords[ 3 ] = normalize( coords[ 3 ] );
	vec3 vectorFormFactor = vec3( 0.0 );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 0 ], coords[ 1 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 1 ], coords[ 2 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 2 ], coords[ 3 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 3 ], coords[ 0 ] );
	float result = LTC_ClippedSphereFormFactor( vectorFormFactor );
	return vec3( result );
}
#if defined( USE_SHEEN )
float D_Charlie( float roughness, float dotNH ) {
	float alpha = pow2( roughness );
	float invAlpha = 1.0 / alpha;
	float cos2h = dotNH * dotNH;
	float sin2h = max( 1.0 - cos2h, 0.0078125 );
	return ( 2.0 + invAlpha ) * pow( sin2h, invAlpha * 0.5 ) / ( 2.0 * PI );
}
float V_Neubelt( float dotNV, float dotNL ) {
	return saturate( 1.0 / ( 4.0 * ( dotNL + dotNV - dotNL * dotNV ) ) );
}
vec3 BRDF_Sheen( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, vec3 sheenColor, const in float sheenRoughness ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float D = D_Charlie( sheenRoughness, dotNH );
	float V = V_Neubelt( dotNV, dotNL );
	return sheenColor * ( D * V );
}
#endif
float IBLSheenBRDF( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	float r2 = roughness * roughness;
	float a = roughness < 0.25 ? -339.2 * r2 + 161.4 * roughness - 25.9 : -8.48 * r2 + 14.3 * roughness - 9.95;
	float b = roughness < 0.25 ? 44.0 * r2 - 23.7 * roughness + 3.26 : 1.97 * r2 - 3.27 * roughness + 0.72;
	float DG = exp( a * dotNV + b ) + ( roughness < 0.25 ? 0.0 : 0.1 * ( roughness - 0.25 ) );
	return saturate( DG * RECIPROCAL_PI );
}
vec2 DFGApprox( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	const vec4 c0 = vec4( - 1, - 0.0275, - 0.572, 0.022 );
	const vec4 c1 = vec4( 1, 0.0425, 1.04, - 0.04 );
	vec4 r = roughness * c0 + c1;
	float a004 = min( r.x * r.x, exp2( - 9.28 * dotNV ) ) * r.x + r.y;
	vec2 fab = vec2( - 1.04, 1.04 ) * a004 + r.zw;
	return fab;
}
vec3 EnvironmentBRDF( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness ) {
	vec2 fab = DFGApprox( normal, viewDir, roughness );
	return specularColor * fab.x + specularF90 * fab.y;
}
#ifdef USE_IRIDESCENCE
void computeMultiscatteringIridescence( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float iridescence, const in vec3 iridescenceF0, const in float roughness, inout vec3 singleScatter, inout vec3 multiScatter ) {
#else
void computeMultiscattering( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness, inout vec3 singleScatter, inout vec3 multiScatter ) {
#endif
	vec2 fab = DFGApprox( normal, viewDir, roughness );
	#ifdef USE_IRIDESCENCE
		vec3 Fr = mix( specularColor, iridescenceF0, iridescence );
	#else
		vec3 Fr = specularColor;
	#endif
	vec3 FssEss = Fr * fab.x + specularF90 * fab.y;
	float Ess = fab.x + fab.y;
	float Ems = 1.0 - Ess;
	vec3 Favg = Fr + ( 1.0 - Fr ) * 0.047619;	vec3 Fms = FssEss * Favg / ( 1.0 - Ems * Favg );
	singleScatter += FssEss;
	multiScatter += Fms * Ems;
}
#if NUM_RECT_AREA_LIGHTS > 0
	void RE_Direct_RectArea_Physical( const in RectAreaLight rectAreaLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
		vec3 normal = geometryNormal;
		vec3 viewDir = geometryViewDir;
		vec3 position = geometryPosition;
		vec3 lightPos = rectAreaLight.position;
		vec3 halfWidth = rectAreaLight.halfWidth;
		vec3 halfHeight = rectAreaLight.halfHeight;
		vec3 lightColor = rectAreaLight.color;
		float roughness = material.roughness;
		vec3 rectCoords[ 4 ];
		rectCoords[ 0 ] = lightPos + halfWidth - halfHeight;		rectCoords[ 1 ] = lightPos - halfWidth - halfHeight;
		rectCoords[ 2 ] = lightPos - halfWidth + halfHeight;
		rectCoords[ 3 ] = lightPos + halfWidth + halfHeight;
		vec2 uv = LTC_Uv( normal, viewDir, roughness );
		vec4 t1 = texture2D( ltc_1, uv );
		vec4 t2 = texture2D( ltc_2, uv );
		mat3 mInv = mat3(
			vec3( t1.x, 0, t1.y ),
			vec3(    0, 1,    0 ),
			vec3( t1.z, 0, t1.w )
		);
		vec3 fresnel = ( material.specularColor * t2.x + ( vec3( 1.0 ) - material.specularColor ) * t2.y );
		reflectedLight.directSpecular += lightColor * fresnel * LTC_Evaluate( normal, viewDir, position, mInv, rectCoords );
		reflectedLight.directDiffuse += lightColor * material.diffuseColor * LTC_Evaluate( normal, viewDir, position, mat3( 1.0 ), rectCoords );
	}
#endif
void RE_Direct_Physical( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	#ifdef USE_CLEARCOAT
		float dotNLcc = saturate( dot( geometryClearcoatNormal, directLight.direction ) );
		vec3 ccIrradiance = dotNLcc * directLight.color;
		clearcoatSpecularDirect += ccIrradiance * BRDF_GGX_Clearcoat( directLight.direction, geometryViewDir, geometryClearcoatNormal, material );
	#endif
	#ifdef USE_SHEEN
		sheenSpecularDirect += irradiance * BRDF_Sheen( directLight.direction, geometryViewDir, geometryNormal, material.sheenColor, material.sheenRoughness );
	#endif
	reflectedLight.directSpecular += irradiance * BRDF_GGX( directLight.direction, geometryViewDir, geometryNormal, material );
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Physical( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectSpecular_Physical( const in vec3 radiance, const in vec3 irradiance, const in vec3 clearcoatRadiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight) {
	#ifdef USE_CLEARCOAT
		clearcoatSpecularIndirect += clearcoatRadiance * EnvironmentBRDF( geometryClearcoatNormal, geometryViewDir, material.clearcoatF0, material.clearcoatF90, material.clearcoatRoughness );
	#endif
	#ifdef USE_SHEEN
		sheenSpecularIndirect += irradiance * material.sheenColor * IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
	#endif
	vec3 singleScattering = vec3( 0.0 );
	vec3 multiScattering = vec3( 0.0 );
	vec3 cosineWeightedIrradiance = irradiance * RECIPROCAL_PI;
	#ifdef USE_IRIDESCENCE
		computeMultiscatteringIridescence( geometryNormal, geometryViewDir, material.specularColor, material.specularF90, material.iridescence, material.iridescenceFresnel, material.roughness, singleScattering, multiScattering );
	#else
		computeMultiscattering( geometryNormal, geometryViewDir, material.specularColor, material.specularF90, material.roughness, singleScattering, multiScattering );
	#endif
	vec3 totalScattering = singleScattering + multiScattering;
	vec3 diffuse = material.diffuseColor * ( 1.0 - max( max( totalScattering.r, totalScattering.g ), totalScattering.b ) );
	reflectedLight.indirectSpecular += radiance * singleScattering;
	reflectedLight.indirectSpecular += multiScattering * cosineWeightedIrradiance;
	reflectedLight.indirectDiffuse += diffuse * cosineWeightedIrradiance;
}
#define RE_Direct				RE_Direct_Physical
#define RE_Direct_RectArea		RE_Direct_RectArea_Physical
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Physical
#define RE_IndirectSpecular		RE_IndirectSpecular_Physical
float computeSpecularOcclusion( const in float dotNV, const in float ambientOcclusion, const in float roughness ) {
	return saturate( pow( dotNV + ambientOcclusion, exp2( - 16.0 * roughness - 1.0 ) ) - 1.0 + ambientOcclusion );
}`,i0=`
vec3 geometryPosition = - vViewPosition;
vec3 geometryNormal = normal;
vec3 geometryViewDir = ( isOrthographic ) ? vec3( 0, 0, 1 ) : normalize( vViewPosition );
vec3 geometryClearcoatNormal = vec3( 0.0 );
#ifdef USE_CLEARCOAT
	geometryClearcoatNormal = clearcoatNormal;
#endif
#ifdef USE_IRIDESCENCE
	float dotNVi = saturate( dot( normal, geometryViewDir ) );
	if ( material.iridescenceThickness == 0.0 ) {
		material.iridescence = 0.0;
	} else {
		material.iridescence = saturate( material.iridescence );
	}
	if ( material.iridescence > 0.0 ) {
		material.iridescenceFresnel = evalIridescence( 1.0, material.iridescenceIOR, dotNVi, material.iridescenceThickness, material.specularColor );
		material.iridescenceF0 = Schlick_to_F0( material.iridescenceFresnel, 1.0, dotNVi );
	}
#endif
IncidentLight directLight;
#if ( NUM_POINT_LIGHTS > 0 ) && defined( RE_Direct )
	PointLight pointLight;
	#if defined( USE_SHADOWMAP ) && NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHTS; i ++ ) {
		pointLight = pointLights[ i ];
		getPointLightInfo( pointLight, geometryPosition, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_POINT_LIGHT_SHADOWS )
		pointLightShadow = pointLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getPointShadow( pointShadowMap[ i ], pointLightShadow.shadowMapSize, pointLightShadow.shadowIntensity, pointLightShadow.shadowBias, pointLightShadow.shadowRadius, vPointShadowCoord[ i ], pointLightShadow.shadowCameraNear, pointLightShadow.shadowCameraFar ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_SPOT_LIGHTS > 0 ) && defined( RE_Direct )
	SpotLight spotLight;
	vec4 spotColor;
	vec3 spotLightCoord;
	bool inSpotLightMap;
	#if defined( USE_SHADOWMAP ) && NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHTS; i ++ ) {
		spotLight = spotLights[ i ];
		getSpotLightInfo( spotLight, geometryPosition, directLight );
		#if ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#define SPOT_LIGHT_MAP_INDEX UNROLLED_LOOP_INDEX
		#elif ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		#define SPOT_LIGHT_MAP_INDEX NUM_SPOT_LIGHT_MAPS
		#else
		#define SPOT_LIGHT_MAP_INDEX ( UNROLLED_LOOP_INDEX - NUM_SPOT_LIGHT_SHADOWS + NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#endif
		#if ( SPOT_LIGHT_MAP_INDEX < NUM_SPOT_LIGHT_MAPS )
			spotLightCoord = vSpotLightCoord[ i ].xyz / vSpotLightCoord[ i ].w;
			inSpotLightMap = all( lessThan( abs( spotLightCoord * 2. - 1. ), vec3( 1.0 ) ) );
			spotColor = texture2D( spotLightMap[ SPOT_LIGHT_MAP_INDEX ], spotLightCoord.xy );
			directLight.color = inSpotLightMap ? directLight.color * spotColor.rgb : directLight.color;
		#endif
		#undef SPOT_LIGHT_MAP_INDEX
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		spotLightShadow = spotLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( spotShadowMap[ i ], spotLightShadow.shadowMapSize, spotLightShadow.shadowIntensity, spotLightShadow.shadowBias, spotLightShadow.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_DIR_LIGHTS > 0 ) && defined( RE_Direct )
	DirectionalLight directionalLight;
	#if defined( USE_SHADOWMAP ) && NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHTS; i ++ ) {
		directionalLight = directionalLights[ i ];
		getDirectionalLightInfo( directionalLight, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_DIR_LIGHT_SHADOWS )
		directionalLightShadow = directionalLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( directionalShadowMap[ i ], directionalLightShadow.shadowMapSize, directionalLightShadow.shadowIntensity, directionalLightShadow.shadowBias, directionalLightShadow.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_RECT_AREA_LIGHTS > 0 ) && defined( RE_Direct_RectArea )
	RectAreaLight rectAreaLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_RECT_AREA_LIGHTS; i ++ ) {
		rectAreaLight = rectAreaLights[ i ];
		RE_Direct_RectArea( rectAreaLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if defined( RE_IndirectDiffuse )
	vec3 iblIrradiance = vec3( 0.0 );
	vec3 irradiance = getAmbientLightIrradiance( ambientLightColor );
	#if defined( USE_LIGHT_PROBES )
		irradiance += getLightProbeIrradiance( lightProbe, geometryNormal );
	#endif
	#if ( NUM_HEMI_LIGHTS > 0 )
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_HEMI_LIGHTS; i ++ ) {
			irradiance += getHemisphereLightIrradiance( hemisphereLights[ i ], geometryNormal );
		}
		#pragma unroll_loop_end
	#endif
#endif
#if defined( RE_IndirectSpecular )
	vec3 radiance = vec3( 0.0 );
	vec3 clearcoatRadiance = vec3( 0.0 );
#endif`,s0=`#if defined( RE_IndirectDiffuse )
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		vec3 lightMapIrradiance = lightMapTexel.rgb * lightMapIntensity;
		irradiance += lightMapIrradiance;
	#endif
	#if defined( USE_ENVMAP ) && defined( STANDARD ) && defined( ENVMAP_TYPE_CUBE_UV )
		iblIrradiance += getIBLIrradiance( geometryNormal );
	#endif
#endif
#if defined( USE_ENVMAP ) && defined( RE_IndirectSpecular )
	#ifdef USE_ANISOTROPY
		radiance += getIBLAnisotropyRadiance( geometryViewDir, geometryNormal, material.roughness, material.anisotropyB, material.anisotropy );
	#else
		radiance += getIBLRadiance( geometryViewDir, geometryNormal, material.roughness );
	#endif
	#ifdef USE_CLEARCOAT
		clearcoatRadiance += getIBLRadiance( geometryViewDir, geometryClearcoatNormal, material.clearcoatRoughness );
	#endif
#endif`,r0=`#if defined( RE_IndirectDiffuse )
	RE_IndirectDiffuse( irradiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif
#if defined( RE_IndirectSpecular )
	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif`,a0=`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	gl_FragDepth = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;
#endif`,o0=`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	uniform float logDepthBufFC;
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,l0=`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,c0=`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	vFragDepth = 1.0 + gl_Position.w;
	vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );
#endif`,h0=`#ifdef USE_MAP
	vec4 sampledDiffuseColor = texture2D( map, vMapUv );
	#ifdef DECODE_VIDEO_TEXTURE
		sampledDiffuseColor = sRGBTransferEOTF( sampledDiffuseColor );
	#endif
	diffuseColor *= sampledDiffuseColor;
#endif`,u0=`#ifdef USE_MAP
	uniform sampler2D map;
#endif`,d0=`#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
	#if defined( USE_POINTS_UV )
		vec2 uv = vUv;
	#else
		vec2 uv = ( uvTransform * vec3( gl_PointCoord.x, 1.0 - gl_PointCoord.y, 1 ) ).xy;
	#endif
#endif
#ifdef USE_MAP
	diffuseColor *= texture2D( map, uv );
#endif
#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, uv ).g;
#endif`,f0=`#if defined( USE_POINTS_UV )
	varying vec2 vUv;
#else
	#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
		uniform mat3 uvTransform;
	#endif
#endif
#ifdef USE_MAP
	uniform sampler2D map;
#endif
#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,p0=`float metalnessFactor = metalness;
#ifdef USE_METALNESSMAP
	vec4 texelMetalness = texture2D( metalnessMap, vMetalnessMapUv );
	metalnessFactor *= texelMetalness.b;
#endif`,m0=`#ifdef USE_METALNESSMAP
	uniform sampler2D metalnessMap;
#endif`,g0=`#ifdef USE_INSTANCING_MORPH
	float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	float morphTargetBaseInfluence = texelFetch( morphTexture, ivec2( 0, gl_InstanceID ), 0 ).r;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		morphTargetInfluences[i] =  texelFetch( morphTexture, ivec2( i + 1, gl_InstanceID ), 0 ).r;
	}
#endif`,v0=`#if defined( USE_MORPHCOLORS )
	vColor *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		#if defined( USE_COLOR_ALPHA )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ) * morphTargetInfluences[ i ];
		#elif defined( USE_COLOR )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ).rgb * morphTargetInfluences[ i ];
		#endif
	}
#endif`,S0=`#ifdef USE_MORPHNORMALS
	objectNormal *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) objectNormal += getMorph( gl_VertexID, i, 1 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,x0=`#ifdef USE_MORPHTARGETS
	#ifndef USE_INSTANCING_MORPH
		uniform float morphTargetBaseInfluence;
		uniform float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	#endif
	uniform sampler2DArray morphTargetsTexture;
	uniform ivec2 morphTargetsTextureSize;
	vec4 getMorph( const in int vertexIndex, const in int morphTargetIndex, const in int offset ) {
		int texelIndex = vertexIndex * MORPHTARGETS_TEXTURE_STRIDE + offset;
		int y = texelIndex / morphTargetsTextureSize.x;
		int x = texelIndex - y * morphTargetsTextureSize.x;
		ivec3 morphUV = ivec3( x, y, morphTargetIndex );
		return texelFetch( morphTargetsTexture, morphUV, 0 );
	}
#endif`,_0=`#ifdef USE_MORPHTARGETS
	transformed *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) transformed += getMorph( gl_VertexID, i, 0 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,y0=`float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
#ifdef FLAT_SHADED
	vec3 fdx = dFdx( vViewPosition );
	vec3 fdy = dFdy( vViewPosition );
	vec3 normal = normalize( cross( fdx, fdy ) );
#else
	vec3 normal = normalize( vNormal );
	#ifdef DOUBLE_SIDED
		normal *= faceDirection;
	#endif
#endif
#if defined( USE_NORMALMAP_TANGENTSPACE ) || defined( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY )
	#ifdef USE_TANGENT
		mat3 tbn = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn = getTangentFrame( - vViewPosition, normal,
		#if defined( USE_NORMALMAP )
			vNormalMapUv
		#elif defined( USE_CLEARCOAT_NORMALMAP )
			vClearcoatNormalMapUv
		#else
			vUv
		#endif
		);
	#endif
	#if defined( DOUBLE_SIDED ) && ! defined( FLAT_SHADED )
		tbn[0] *= faceDirection;
		tbn[1] *= faceDirection;
	#endif
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	#ifdef USE_TANGENT
		mat3 tbn2 = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn2 = getTangentFrame( - vViewPosition, normal, vClearcoatNormalMapUv );
	#endif
	#if defined( DOUBLE_SIDED ) && ! defined( FLAT_SHADED )
		tbn2[0] *= faceDirection;
		tbn2[1] *= faceDirection;
	#endif
#endif
vec3 nonPerturbedNormal = normal;`,M0=`#ifdef USE_NORMALMAP_OBJECTSPACE
	normal = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	#ifdef FLIP_SIDED
		normal = - normal;
	#endif
	#ifdef DOUBLE_SIDED
		normal = normal * faceDirection;
	#endif
	normal = normalize( normalMatrix * normal );
#elif defined( USE_NORMALMAP_TANGENTSPACE )
	vec3 mapN = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	mapN.xy *= normalScale;
	normal = normalize( tbn * mapN );
#elif defined( USE_BUMPMAP )
	normal = perturbNormalArb( - vViewPosition, normal, dHdxy_fwd(), faceDirection );
#endif`,b0=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,R0=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,w0=`#ifndef FLAT_SHADED
	vNormal = normalize( transformedNormal );
	#ifdef USE_TANGENT
		vTangent = normalize( transformedTangent );
		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
	#endif
#endif`,E0=`#ifdef USE_NORMALMAP
	uniform sampler2D normalMap;
	uniform vec2 normalScale;
#endif
#ifdef USE_NORMALMAP_OBJECTSPACE
	uniform mat3 normalMatrix;
#endif
#if ! defined ( USE_TANGENT ) && ( defined ( USE_NORMALMAP_TANGENTSPACE ) || defined ( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY ) )
	mat3 getTangentFrame( vec3 eye_pos, vec3 surf_norm, vec2 uv ) {
		vec3 q0 = dFdx( eye_pos.xyz );
		vec3 q1 = dFdy( eye_pos.xyz );
		vec2 st0 = dFdx( uv.st );
		vec2 st1 = dFdy( uv.st );
		vec3 N = surf_norm;
		vec3 q1perp = cross( q1, N );
		vec3 q0perp = cross( N, q0 );
		vec3 T = q1perp * st0.x + q0perp * st1.x;
		vec3 B = q1perp * st0.y + q0perp * st1.y;
		float det = max( dot( T, T ), dot( B, B ) );
		float scale = ( det == 0.0 ) ? 0.0 : inversesqrt( det );
		return mat3( T * scale, B * scale, N );
	}
#endif`,T0=`#ifdef USE_CLEARCOAT
	vec3 clearcoatNormal = nonPerturbedNormal;
#endif`,C0=`#ifdef USE_CLEARCOAT_NORMALMAP
	vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vClearcoatNormalMapUv ).xyz * 2.0 - 1.0;
	clearcoatMapN.xy *= clearcoatNormalScale;
	clearcoatNormal = normalize( tbn2 * clearcoatMapN );
#endif`,A0=`#ifdef USE_CLEARCOATMAP
	uniform sampler2D clearcoatMap;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform sampler2D clearcoatNormalMap;
	uniform vec2 clearcoatNormalScale;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform sampler2D clearcoatRoughnessMap;
#endif`,L0=`#ifdef USE_IRIDESCENCEMAP
	uniform sampler2D iridescenceMap;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform sampler2D iridescenceThicknessMap;
#endif`,P0=`#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif
#ifdef USE_TRANSMISSION
diffuseColor.a *= material.transmissionAlpha;
#endif
gl_FragColor = vec4( outgoingLight, diffuseColor.a );`,F0=`vec3 packNormalToRGB( const in vec3 normal ) {
	return normalize( normal ) * 0.5 + 0.5;
}
vec3 unpackRGBToNormal( const in vec3 rgb ) {
	return 2.0 * rgb.xyz - 1.0;
}
const float PackUpscale = 256. / 255.;const float UnpackDownscale = 255. / 256.;const float ShiftRight8 = 1. / 256.;
const float Inv255 = 1. / 255.;
const vec4 PackFactors = vec4( 1.0, 256.0, 256.0 * 256.0, 256.0 * 256.0 * 256.0 );
const vec2 UnpackFactors2 = vec2( UnpackDownscale, 1.0 / PackFactors.g );
const vec3 UnpackFactors3 = vec3( UnpackDownscale / PackFactors.rg, 1.0 / PackFactors.b );
const vec4 UnpackFactors4 = vec4( UnpackDownscale / PackFactors.rgb, 1.0 / PackFactors.a );
vec4 packDepthToRGBA( const in float v ) {
	if( v <= 0.0 )
		return vec4( 0., 0., 0., 0. );
	if( v >= 1.0 )
		return vec4( 1., 1., 1., 1. );
	float vuf;
	float af = modf( v * PackFactors.a, vuf );
	float bf = modf( vuf * ShiftRight8, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec4( vuf * Inv255, gf * PackUpscale, bf * PackUpscale, af );
}
vec3 packDepthToRGB( const in float v ) {
	if( v <= 0.0 )
		return vec3( 0., 0., 0. );
	if( v >= 1.0 )
		return vec3( 1., 1., 1. );
	float vuf;
	float bf = modf( v * PackFactors.b, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec3( vuf * Inv255, gf * PackUpscale, bf );
}
vec2 packDepthToRG( const in float v ) {
	if( v <= 0.0 )
		return vec2( 0., 0. );
	if( v >= 1.0 )
		return vec2( 1., 1. );
	float vuf;
	float gf = modf( v * 256., vuf );
	return vec2( vuf * Inv255, gf );
}
float unpackRGBAToDepth( const in vec4 v ) {
	return dot( v, UnpackFactors4 );
}
float unpackRGBToDepth( const in vec3 v ) {
	return dot( v, UnpackFactors3 );
}
float unpackRGToDepth( const in vec2 v ) {
	return v.r * UnpackFactors2.r + v.g * UnpackFactors2.g;
}
vec4 pack2HalfToRGBA( const in vec2 v ) {
	vec4 r = vec4( v.x, fract( v.x * 255.0 ), v.y, fract( v.y * 255.0 ) );
	return vec4( r.x - r.y / 255.0, r.y, r.z - r.w / 255.0, r.w );
}
vec2 unpackRGBATo2Half( const in vec4 v ) {
	return vec2( v.x + ( v.y / 255.0 ), v.z + ( v.w / 255.0 ) );
}
float viewZToOrthographicDepth( const in float viewZ, const in float near, const in float far ) {
	return ( viewZ + near ) / ( near - far );
}
float orthographicDepthToViewZ( const in float depth, const in float near, const in float far ) {
	return depth * ( near - far ) - near;
}
float viewZToPerspectiveDepth( const in float viewZ, const in float near, const in float far ) {
	return ( ( near + viewZ ) * far ) / ( ( far - near ) * viewZ );
}
float perspectiveDepthToViewZ( const in float depth, const in float near, const in float far ) {
	return ( near * far ) / ( ( far - near ) * depth - far );
}`,I0=`#ifdef PREMULTIPLIED_ALPHA
	gl_FragColor.rgb *= gl_FragColor.a;
#endif`,D0=`vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_BATCHING
	mvPosition = batchingMatrix * mvPosition;
#endif
#ifdef USE_INSTANCING
	mvPosition = instanceMatrix * mvPosition;
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;`,B0=`#ifdef DITHERING
	gl_FragColor.rgb = dithering( gl_FragColor.rgb );
#endif`,U0=`#ifdef DITHERING
	vec3 dithering( vec3 color ) {
		float grid_position = rand( gl_FragCoord.xy );
		vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );
		dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );
		return color + dither_shift_RGB;
	}
#endif`,N0=`float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
	vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );
	roughnessFactor *= texelRoughness.g;
#endif`,O0=`#ifdef USE_ROUGHNESSMAP
	uniform sampler2D roughnessMap;
#endif`,z0=`#if NUM_SPOT_LIGHT_COORDS > 0
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#if NUM_SPOT_LIGHT_MAPS > 0
	uniform sampler2D spotLightMap[ NUM_SPOT_LIGHT_MAPS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform sampler2D directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		uniform sampler2D spotShadowMap[ NUM_SPOT_LIGHT_SHADOWS ];
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		uniform sampler2D pointShadowMap[ NUM_POINT_LIGHT_SHADOWS ];
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
	float texture2DCompare( sampler2D depths, vec2 uv, float compare ) {
		float depth = unpackRGBAToDepth( texture2D( depths, uv ) );
		#ifdef USE_REVERSED_DEPTH_BUFFER
			return step( depth, compare );
		#else
			return step( compare, depth );
		#endif
	}
	vec2 texture2DDistribution( sampler2D shadow, vec2 uv ) {
		return unpackRGBATo2Half( texture2D( shadow, uv ) );
	}
	float VSMShadow( sampler2D shadow, vec2 uv, float compare ) {
		float occlusion = 1.0;
		vec2 distribution = texture2DDistribution( shadow, uv );
		#ifdef USE_REVERSED_DEPTH_BUFFER
			float hard_shadow = step( distribution.x, compare );
		#else
			float hard_shadow = step( compare, distribution.x );
		#endif
		if ( hard_shadow != 1.0 ) {
			float distance = compare - distribution.x;
			float variance = max( 0.00000, distribution.y * distribution.y );
			float softness_probability = variance / (variance + distance * distance );			softness_probability = clamp( ( softness_probability - 0.3 ) / ( 0.95 - 0.3 ), 0.0, 1.0 );			occlusion = clamp( max( hard_shadow, softness_probability ), 0.0, 1.0 );
		}
		return occlusion;
	}
	float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
		float shadow = 1.0;
		shadowCoord.xyz /= shadowCoord.w;
		shadowCoord.z += shadowBias;
		bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
		bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
		if ( frustumTest ) {
		#if defined( SHADOWMAP_TYPE_PCF )
			vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
			float dx0 = - texelSize.x * shadowRadius;
			float dy0 = - texelSize.y * shadowRadius;
			float dx1 = + texelSize.x * shadowRadius;
			float dy1 = + texelSize.y * shadowRadius;
			float dx2 = dx0 / 2.0;
			float dy2 = dy0 / 2.0;
			float dx3 = dx1 / 2.0;
			float dy3 = dy1 / 2.0;
			shadow = (
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy, shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, dy1 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy1 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, dy1 ), shadowCoord.z )
			) * ( 1.0 / 17.0 );
		#elif defined( SHADOWMAP_TYPE_PCF_SOFT )
			vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
			float dx = texelSize.x;
			float dy = texelSize.y;
			vec2 uv = shadowCoord.xy;
			vec2 f = fract( uv * shadowMapSize + 0.5 );
			uv -= f * texelSize;
			shadow = (
				texture2DCompare( shadowMap, uv, shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + vec2( dx, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + vec2( 0.0, dy ), shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + texelSize, shadowCoord.z ) +
				mix( texture2DCompare( shadowMap, uv + vec2( -dx, 0.0 ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, 0.0 ), shadowCoord.z ),
					 f.x ) +
				mix( texture2DCompare( shadowMap, uv + vec2( -dx, dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, dy ), shadowCoord.z ),
					 f.x ) +
				mix( texture2DCompare( shadowMap, uv + vec2( 0.0, -dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 0.0, 2.0 * dy ), shadowCoord.z ),
					 f.y ) +
				mix( texture2DCompare( shadowMap, uv + vec2( dx, -dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( dx, 2.0 * dy ), shadowCoord.z ),
					 f.y ) +
				mix( mix( texture2DCompare( shadowMap, uv + vec2( -dx, -dy ), shadowCoord.z ),
						  texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, -dy ), shadowCoord.z ),
						  f.x ),
					 mix( texture2DCompare( shadowMap, uv + vec2( -dx, 2.0 * dy ), shadowCoord.z ),
						  texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, 2.0 * dy ), shadowCoord.z ),
						  f.x ),
					 f.y )
			) * ( 1.0 / 9.0 );
		#elif defined( SHADOWMAP_TYPE_VSM )
			shadow = VSMShadow( shadowMap, shadowCoord.xy, shadowCoord.z );
		#else
			shadow = texture2DCompare( shadowMap, shadowCoord.xy, shadowCoord.z );
		#endif
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
	vec2 cubeToUV( vec3 v, float texelSizeY ) {
		vec3 absV = abs( v );
		float scaleToCube = 1.0 / max( absV.x, max( absV.y, absV.z ) );
		absV *= scaleToCube;
		v *= scaleToCube * ( 1.0 - 2.0 * texelSizeY );
		vec2 planar = v.xy;
		float almostATexel = 1.5 * texelSizeY;
		float almostOne = 1.0 - almostATexel;
		if ( absV.z >= almostOne ) {
			if ( v.z > 0.0 )
				planar.x = 4.0 - v.x;
		} else if ( absV.x >= almostOne ) {
			float signX = sign( v.x );
			planar.x = v.z * signX + 2.0 * signX;
		} else if ( absV.y >= almostOne ) {
			float signY = sign( v.y );
			planar.x = v.x + 2.0 * signY + 2.0;
			planar.y = v.z * signY - 2.0;
		}
		return vec2( 0.125, 0.25 ) * planar + vec2( 0.375, 0.75 );
	}
	float getPointShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {
		float shadow = 1.0;
		vec3 lightToPosition = shadowCoord.xyz;
		
		float lightToPositionLength = length( lightToPosition );
		if ( lightToPositionLength - shadowCameraFar <= 0.0 && lightToPositionLength - shadowCameraNear >= 0.0 ) {
			float dp = ( lightToPositionLength - shadowCameraNear ) / ( shadowCameraFar - shadowCameraNear );			dp += shadowBias;
			vec3 bd3D = normalize( lightToPosition );
			vec2 texelSize = vec2( 1.0 ) / ( shadowMapSize * vec2( 4.0, 2.0 ) );
			#if defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_PCF_SOFT ) || defined( SHADOWMAP_TYPE_VSM )
				vec2 offset = vec2( - 1, 1 ) * shadowRadius * texelSize.y;
				shadow = (
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xyy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yyy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xyx, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yyx, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xxy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yxy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xxx, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yxx, texelSize.y ), dp )
				) * ( 1.0 / 9.0 );
			#else
				shadow = texture2DCompare( shadowMap, cubeToUV( bd3D, texelSize.y ), dp );
			#endif
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
#endif`,k0=`#if NUM_SPOT_LIGHT_COORDS > 0
	uniform mat4 spotLightMatrix[ NUM_SPOT_LIGHT_COORDS ];
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform mat4 directionalShadowMatrix[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		uniform mat4 pointShadowMatrix[ NUM_POINT_LIGHT_SHADOWS ];
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
#endif`,H0=`#if ( defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS > 0 || NUM_POINT_LIGHT_SHADOWS > 0 ) ) || ( NUM_SPOT_LIGHT_COORDS > 0 )
	vec3 shadowWorldNormal = inverseTransformDirection( transformedNormal, viewMatrix );
	vec4 shadowWorldPosition;
#endif
#if defined( USE_SHADOWMAP )
	#if NUM_DIR_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * directionalLightShadows[ i ].shadowNormalBias, 0 );
			vDirectionalShadowCoord[ i ] = directionalShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * pointLightShadows[ i ].shadowNormalBias, 0 );
			vPointShadowCoord[ i ] = pointShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
#endif
#if NUM_SPOT_LIGHT_COORDS > 0
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_COORDS; i ++ ) {
		shadowWorldPosition = worldPosition;
		#if ( defined( USE_SHADOWMAP ) && UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
			shadowWorldPosition.xyz += shadowWorldNormal * spotLightShadows[ i ].shadowNormalBias;
		#endif
		vSpotLightCoord[ i ] = spotLightMatrix[ i ] * shadowWorldPosition;
	}
	#pragma unroll_loop_end
#endif`,G0=`float getShadowMask() {
	float shadow = 1.0;
	#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
		directionalLight = directionalLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( directionalShadowMap[ i ], directionalLight.shadowMapSize, directionalLight.shadowIntensity, directionalLight.shadowBias, directionalLight.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_SHADOWS; i ++ ) {
		spotLight = spotLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( spotShadowMap[ i ], spotLight.shadowMapSize, spotLight.shadowIntensity, spotLight.shadowBias, spotLight.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
		pointLight = pointLightShadows[ i ];
		shadow *= receiveShadow ? getPointShadow( pointShadowMap[ i ], pointLight.shadowMapSize, pointLight.shadowIntensity, pointLight.shadowBias, pointLight.shadowRadius, vPointShadowCoord[ i ], pointLight.shadowCameraNear, pointLight.shadowCameraFar ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#endif
	return shadow;
}`,V0=`#ifdef USE_SKINNING
	mat4 boneMatX = getBoneMatrix( skinIndex.x );
	mat4 boneMatY = getBoneMatrix( skinIndex.y );
	mat4 boneMatZ = getBoneMatrix( skinIndex.z );
	mat4 boneMatW = getBoneMatrix( skinIndex.w );
#endif`,W0=`#ifdef USE_SKINNING
	uniform mat4 bindMatrix;
	uniform mat4 bindMatrixInverse;
	uniform highp sampler2D boneTexture;
	mat4 getBoneMatrix( const in float i ) {
		int size = textureSize( boneTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( boneTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( boneTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( boneTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( boneTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
#endif`,$0=`#ifdef USE_SKINNING
	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );
	vec4 skinned = vec4( 0.0 );
	skinned += boneMatX * skinVertex * skinWeight.x;
	skinned += boneMatY * skinVertex * skinWeight.y;
	skinned += boneMatZ * skinVertex * skinWeight.z;
	skinned += boneMatW * skinVertex * skinWeight.w;
	transformed = ( bindMatrixInverse * skinned ).xyz;
#endif`,X0=`#ifdef USE_SKINNING
	mat4 skinMatrix = mat4( 0.0 );
	skinMatrix += skinWeight.x * boneMatX;
	skinMatrix += skinWeight.y * boneMatY;
	skinMatrix += skinWeight.z * boneMatZ;
	skinMatrix += skinWeight.w * boneMatW;
	skinMatrix = bindMatrixInverse * skinMatrix * bindMatrix;
	objectNormal = vec4( skinMatrix * vec4( objectNormal, 0.0 ) ).xyz;
	#ifdef USE_TANGENT
		objectTangent = vec4( skinMatrix * vec4( objectTangent, 0.0 ) ).xyz;
	#endif
#endif`,q0=`float specularStrength;
#ifdef USE_SPECULARMAP
	vec4 texelSpecular = texture2D( specularMap, vSpecularMapUv );
	specularStrength = texelSpecular.r;
#else
	specularStrength = 1.0;
#endif`,Y0=`#ifdef USE_SPECULARMAP
	uniform sampler2D specularMap;
#endif`,J0=`#if defined( TONE_MAPPING )
	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif`,K0=`#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
uniform float toneMappingExposure;
vec3 LinearToneMapping( vec3 color ) {
	return saturate( toneMappingExposure * color );
}
vec3 ReinhardToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	return saturate( color / ( vec3( 1.0 ) + color ) );
}
vec3 CineonToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	color = max( vec3( 0.0 ), color - 0.004 );
	return pow( ( color * ( 6.2 * color + 0.5 ) ) / ( color * ( 6.2 * color + 1.7 ) + 0.06 ), vec3( 2.2 ) );
}
vec3 RRTAndODTFit( vec3 v ) {
	vec3 a = v * ( v + 0.0245786 ) - 0.000090537;
	vec3 b = v * ( 0.983729 * v + 0.4329510 ) + 0.238081;
	return a / b;
}
vec3 ACESFilmicToneMapping( vec3 color ) {
	const mat3 ACESInputMat = mat3(
		vec3( 0.59719, 0.07600, 0.02840 ),		vec3( 0.35458, 0.90834, 0.13383 ),
		vec3( 0.04823, 0.01566, 0.83777 )
	);
	const mat3 ACESOutputMat = mat3(
		vec3(  1.60475, -0.10208, -0.00327 ),		vec3( -0.53108,  1.10813, -0.07276 ),
		vec3( -0.07367, -0.00605,  1.07602 )
	);
	color *= toneMappingExposure / 0.6;
	color = ACESInputMat * color;
	color = RRTAndODTFit( color );
	color = ACESOutputMat * color;
	return saturate( color );
}
const mat3 LINEAR_REC2020_TO_LINEAR_SRGB = mat3(
	vec3( 1.6605, - 0.1246, - 0.0182 ),
	vec3( - 0.5876, 1.1329, - 0.1006 ),
	vec3( - 0.0728, - 0.0083, 1.1187 )
);
const mat3 LINEAR_SRGB_TO_LINEAR_REC2020 = mat3(
	vec3( 0.6274, 0.0691, 0.0164 ),
	vec3( 0.3293, 0.9195, 0.0880 ),
	vec3( 0.0433, 0.0113, 0.8956 )
);
vec3 agxDefaultContrastApprox( vec3 x ) {
	vec3 x2 = x * x;
	vec3 x4 = x2 * x2;
	return + 15.5 * x4 * x2
		- 40.14 * x4 * x
		+ 31.96 * x4
		- 6.868 * x2 * x
		+ 0.4298 * x2
		+ 0.1191 * x
		- 0.00232;
}
vec3 AgXToneMapping( vec3 color ) {
	const mat3 AgXInsetMatrix = mat3(
		vec3( 0.856627153315983, 0.137318972929847, 0.11189821299995 ),
		vec3( 0.0951212405381588, 0.761241990602591, 0.0767994186031903 ),
		vec3( 0.0482516061458583, 0.101439036467562, 0.811302368396859 )
	);
	const mat3 AgXOutsetMatrix = mat3(
		vec3( 1.1271005818144368, - 0.1413297634984383, - 0.14132976349843826 ),
		vec3( - 0.11060664309660323, 1.157823702216272, - 0.11060664309660294 ),
		vec3( - 0.016493938717834573, - 0.016493938717834257, 1.2519364065950405 )
	);
	const float AgxMinEv = - 12.47393;	const float AgxMaxEv = 4.026069;
	color *= toneMappingExposure;
	color = LINEAR_SRGB_TO_LINEAR_REC2020 * color;
	color = AgXInsetMatrix * color;
	color = max( color, 1e-10 );	color = log2( color );
	color = ( color - AgxMinEv ) / ( AgxMaxEv - AgxMinEv );
	color = clamp( color, 0.0, 1.0 );
	color = agxDefaultContrastApprox( color );
	color = AgXOutsetMatrix * color;
	color = pow( max( vec3( 0.0 ), color ), vec3( 2.2 ) );
	color = LINEAR_REC2020_TO_LINEAR_SRGB * color;
	color = clamp( color, 0.0, 1.0 );
	return color;
}
vec3 NeutralToneMapping( vec3 color ) {
	const float StartCompression = 0.8 - 0.04;
	const float Desaturation = 0.15;
	color *= toneMappingExposure;
	float x = min( color.r, min( color.g, color.b ) );
	float offset = x < 0.08 ? x - 6.25 * x * x : 0.04;
	color -= offset;
	float peak = max( color.r, max( color.g, color.b ) );
	if ( peak < StartCompression ) return color;
	float d = 1. - StartCompression;
	float newPeak = 1. - d * d / ( peak + d - StartCompression );
	color *= newPeak / peak;
	float g = 1. - 1. / ( Desaturation * ( peak - newPeak ) + 1. );
	return mix( color, vec3( newPeak ), g );
}
vec3 CustomToneMapping( vec3 color ) { return color; }`,Z0=`#ifdef USE_TRANSMISSION
	material.transmission = transmission;
	material.transmissionAlpha = 1.0;
	material.thickness = thickness;
	material.attenuationDistance = attenuationDistance;
	material.attenuationColor = attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		material.transmission *= texture2D( transmissionMap, vTransmissionMapUv ).r;
	#endif
	#ifdef USE_THICKNESSMAP
		material.thickness *= texture2D( thicknessMap, vThicknessMapUv ).g;
	#endif
	vec3 pos = vWorldPosition;
	vec3 v = normalize( cameraPosition - pos );
	vec3 n = inverseTransformDirection( normal, viewMatrix );
	vec4 transmitted = getIBLVolumeRefraction(
		n, v, material.roughness, material.diffuseColor, material.specularColor, material.specularF90,
		pos, modelMatrix, viewMatrix, projectionMatrix, material.dispersion, material.ior, material.thickness,
		material.attenuationColor, material.attenuationDistance );
	material.transmissionAlpha = mix( material.transmissionAlpha, transmitted.a, material.transmission );
	totalDiffuse = mix( totalDiffuse, transmitted.rgb, material.transmission );
#endif`,j0=`#ifdef USE_TRANSMISSION
	uniform float transmission;
	uniform float thickness;
	uniform float attenuationDistance;
	uniform vec3 attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		uniform sampler2D transmissionMap;
	#endif
	#ifdef USE_THICKNESSMAP
		uniform sampler2D thicknessMap;
	#endif
	uniform vec2 transmissionSamplerSize;
	uniform sampler2D transmissionSamplerMap;
	uniform mat4 modelMatrix;
	uniform mat4 projectionMatrix;
	varying vec3 vWorldPosition;
	float w0( float a ) {
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - a + 3.0 ) - 3.0 ) + 1.0 );
	}
	float w1( float a ) {
		return ( 1.0 / 6.0 ) * ( a *  a * ( 3.0 * a - 6.0 ) + 4.0 );
	}
	float w2( float a ){
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - 3.0 * a + 3.0 ) + 3.0 ) + 1.0 );
	}
	float w3( float a ) {
		return ( 1.0 / 6.0 ) * ( a * a * a );
	}
	float g0( float a ) {
		return w0( a ) + w1( a );
	}
	float g1( float a ) {
		return w2( a ) + w3( a );
	}
	float h0( float a ) {
		return - 1.0 + w1( a ) / ( w0( a ) + w1( a ) );
	}
	float h1( float a ) {
		return 1.0 + w3( a ) / ( w2( a ) + w3( a ) );
	}
	vec4 bicubic( sampler2D tex, vec2 uv, vec4 texelSize, float lod ) {
		uv = uv * texelSize.zw + 0.5;
		vec2 iuv = floor( uv );
		vec2 fuv = fract( uv );
		float g0x = g0( fuv.x );
		float g1x = g1( fuv.x );
		float h0x = h0( fuv.x );
		float h1x = h1( fuv.x );
		float h0y = h0( fuv.y );
		float h1y = h1( fuv.y );
		vec2 p0 = ( vec2( iuv.x + h0x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p1 = ( vec2( iuv.x + h1x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p2 = ( vec2( iuv.x + h0x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		vec2 p3 = ( vec2( iuv.x + h1x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		return g0( fuv.y ) * ( g0x * textureLod( tex, p0, lod ) + g1x * textureLod( tex, p1, lod ) ) +
			g1( fuv.y ) * ( g0x * textureLod( tex, p2, lod ) + g1x * textureLod( tex, p3, lod ) );
	}
	vec4 textureBicubic( sampler2D sampler, vec2 uv, float lod ) {
		vec2 fLodSize = vec2( textureSize( sampler, int( lod ) ) );
		vec2 cLodSize = vec2( textureSize( sampler, int( lod + 1.0 ) ) );
		vec2 fLodSizeInv = 1.0 / fLodSize;
		vec2 cLodSizeInv = 1.0 / cLodSize;
		vec4 fSample = bicubic( sampler, uv, vec4( fLodSizeInv, fLodSize ), floor( lod ) );
		vec4 cSample = bicubic( sampler, uv, vec4( cLodSizeInv, cLodSize ), ceil( lod ) );
		return mix( fSample, cSample, fract( lod ) );
	}
	vec3 getVolumeTransmissionRay( const in vec3 n, const in vec3 v, const in float thickness, const in float ior, const in mat4 modelMatrix ) {
		vec3 refractionVector = refract( - v, normalize( n ), 1.0 / ior );
		vec3 modelScale;
		modelScale.x = length( vec3( modelMatrix[ 0 ].xyz ) );
		modelScale.y = length( vec3( modelMatrix[ 1 ].xyz ) );
		modelScale.z = length( vec3( modelMatrix[ 2 ].xyz ) );
		return normalize( refractionVector ) * thickness * modelScale;
	}
	float applyIorToRoughness( const in float roughness, const in float ior ) {
		return roughness * clamp( ior * 2.0 - 2.0, 0.0, 1.0 );
	}
	vec4 getTransmissionSample( const in vec2 fragCoord, const in float roughness, const in float ior ) {
		float lod = log2( transmissionSamplerSize.x ) * applyIorToRoughness( roughness, ior );
		return textureBicubic( transmissionSamplerMap, fragCoord.xy, lod );
	}
	vec3 volumeAttenuation( const in float transmissionDistance, const in vec3 attenuationColor, const in float attenuationDistance ) {
		if ( isinf( attenuationDistance ) ) {
			return vec3( 1.0 );
		} else {
			vec3 attenuationCoefficient = -log( attenuationColor ) / attenuationDistance;
			vec3 transmittance = exp( - attenuationCoefficient * transmissionDistance );			return transmittance;
		}
	}
	vec4 getIBLVolumeRefraction( const in vec3 n, const in vec3 v, const in float roughness, const in vec3 diffuseColor,
		const in vec3 specularColor, const in float specularF90, const in vec3 position, const in mat4 modelMatrix,
		const in mat4 viewMatrix, const in mat4 projMatrix, const in float dispersion, const in float ior, const in float thickness,
		const in vec3 attenuationColor, const in float attenuationDistance ) {
		vec4 transmittedLight;
		vec3 transmittance;
		#ifdef USE_DISPERSION
			float halfSpread = ( ior - 1.0 ) * 0.025 * dispersion;
			vec3 iors = vec3( ior - halfSpread, ior, ior + halfSpread );
			for ( int i = 0; i < 3; i ++ ) {
				vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, iors[ i ], modelMatrix );
				vec3 refractedRayExit = position + transmissionRay;
				vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
				vec2 refractionCoords = ndcPos.xy / ndcPos.w;
				refractionCoords += 1.0;
				refractionCoords /= 2.0;
				vec4 transmissionSample = getTransmissionSample( refractionCoords, roughness, iors[ i ] );
				transmittedLight[ i ] = transmissionSample[ i ];
				transmittedLight.a += transmissionSample.a;
				transmittance[ i ] = diffuseColor[ i ] * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance )[ i ];
			}
			transmittedLight.a /= 3.0;
		#else
			vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, ior, modelMatrix );
			vec3 refractedRayExit = position + transmissionRay;
			vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
			vec2 refractionCoords = ndcPos.xy / ndcPos.w;
			refractionCoords += 1.0;
			refractionCoords /= 2.0;
			transmittedLight = getTransmissionSample( refractionCoords, roughness, ior );
			transmittance = diffuseColor * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance );
		#endif
		vec3 attenuatedColor = transmittance * transmittedLight.rgb;
		vec3 F = EnvironmentBRDF( n, v, specularColor, specularF90, roughness );
		float transmittanceFactor = ( transmittance.r + transmittance.g + transmittance.b ) / 3.0;
		return vec4( ( 1.0 - F ) * attenuatedColor, 1.0 - ( 1.0 - transmittedLight.a ) * transmittanceFactor );
	}
#endif`,Q0=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_SPECULARMAP
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,tg=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	uniform mat3 mapTransform;
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	uniform mat3 alphaMapTransform;
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	uniform mat3 lightMapTransform;
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	uniform mat3 aoMapTransform;
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	uniform mat3 bumpMapTransform;
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	uniform mat3 normalMapTransform;
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_DISPLACEMENTMAP
	uniform mat3 displacementMapTransform;
	varying vec2 vDisplacementMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	uniform mat3 emissiveMapTransform;
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	uniform mat3 metalnessMapTransform;
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	uniform mat3 roughnessMapTransform;
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	uniform mat3 anisotropyMapTransform;
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	uniform mat3 clearcoatMapTransform;
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform mat3 clearcoatNormalMapTransform;
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform mat3 clearcoatRoughnessMapTransform;
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	uniform mat3 sheenColorMapTransform;
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	uniform mat3 sheenRoughnessMapTransform;
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	uniform mat3 iridescenceMapTransform;
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform mat3 iridescenceThicknessMapTransform;
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SPECULARMAP
	uniform mat3 specularMapTransform;
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	uniform mat3 specularColorMapTransform;
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	uniform mat3 specularIntensityMapTransform;
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,eg=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	vUv = vec3( uv, 1 ).xy;
#endif
#ifdef USE_MAP
	vMapUv = ( mapTransform * vec3( MAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ALPHAMAP
	vAlphaMapUv = ( alphaMapTransform * vec3( ALPHAMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_LIGHTMAP
	vLightMapUv = ( lightMapTransform * vec3( LIGHTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_AOMAP
	vAoMapUv = ( aoMapTransform * vec3( AOMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_BUMPMAP
	vBumpMapUv = ( bumpMapTransform * vec3( BUMPMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_NORMALMAP
	vNormalMapUv = ( normalMapTransform * vec3( NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_DISPLACEMENTMAP
	vDisplacementMapUv = ( displacementMapTransform * vec3( DISPLACEMENTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_EMISSIVEMAP
	vEmissiveMapUv = ( emissiveMapTransform * vec3( EMISSIVEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_METALNESSMAP
	vMetalnessMapUv = ( metalnessMapTransform * vec3( METALNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ROUGHNESSMAP
	vRoughnessMapUv = ( roughnessMapTransform * vec3( ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ANISOTROPYMAP
	vAnisotropyMapUv = ( anisotropyMapTransform * vec3( ANISOTROPYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOATMAP
	vClearcoatMapUv = ( clearcoatMapTransform * vec3( CLEARCOATMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	vClearcoatNormalMapUv = ( clearcoatNormalMapTransform * vec3( CLEARCOAT_NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	vClearcoatRoughnessMapUv = ( clearcoatRoughnessMapTransform * vec3( CLEARCOAT_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCEMAP
	vIridescenceMapUv = ( iridescenceMapTransform * vec3( IRIDESCENCEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	vIridescenceThicknessMapUv = ( iridescenceThicknessMapTransform * vec3( IRIDESCENCE_THICKNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_COLORMAP
	vSheenColorMapUv = ( sheenColorMapTransform * vec3( SHEEN_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	vSheenRoughnessMapUv = ( sheenRoughnessMapTransform * vec3( SHEEN_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULARMAP
	vSpecularMapUv = ( specularMapTransform * vec3( SPECULARMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_COLORMAP
	vSpecularColorMapUv = ( specularColorMapTransform * vec3( SPECULAR_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	vSpecularIntensityMapUv = ( specularIntensityMapTransform * vec3( SPECULAR_INTENSITYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_TRANSMISSIONMAP
	vTransmissionMapUv = ( transmissionMapTransform * vec3( TRANSMISSIONMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_THICKNESSMAP
	vThicknessMapUv = ( thicknessMapTransform * vec3( THICKNESSMAP_UV, 1 ) ).xy;
#endif`,ng=`#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0
	vec4 worldPosition = vec4( transformed, 1.0 );
	#ifdef USE_BATCHING
		worldPosition = batchingMatrix * worldPosition;
	#endif
	#ifdef USE_INSTANCING
		worldPosition = instanceMatrix * worldPosition;
	#endif
	worldPosition = modelMatrix * worldPosition;
#endif`;const ig=`varying vec2 vUv;
uniform mat3 uvTransform;
void main() {
	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	gl_Position = vec4( position.xy, 1.0, 1.0 );
}`,sg=`uniform sampler2D t2D;
uniform float backgroundIntensity;
varying vec2 vUv;
void main() {
	vec4 texColor = texture2D( t2D, vUv );
	#ifdef DECODE_VIDEO_TEXTURE
		texColor = vec4( mix( pow( texColor.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), texColor.rgb * 0.0773993808, vec3( lessThanEqual( texColor.rgb, vec3( 0.04045 ) ) ) ), texColor.w );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,rg=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,ag=`#ifdef ENVMAP_TYPE_CUBE
	uniform samplerCube envMap;
#elif defined( ENVMAP_TYPE_CUBE_UV )
	uniform sampler2D envMap;
#endif
uniform float flipEnvMap;
uniform float backgroundBlurriness;
uniform float backgroundIntensity;
uniform mat3 backgroundRotation;
varying vec3 vWorldDirection;
#include <cube_uv_reflection_fragment>
void main() {
	#ifdef ENVMAP_TYPE_CUBE
		vec4 texColor = textureCube( envMap, backgroundRotation * vec3( flipEnvMap * vWorldDirection.x, vWorldDirection.yz ) );
	#elif defined( ENVMAP_TYPE_CUBE_UV )
		vec4 texColor = textureCubeUV( envMap, backgroundRotation * vWorldDirection, backgroundBlurriness );
	#else
		vec4 texColor = vec4( 0.0, 0.0, 0.0, 1.0 );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,og=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,lg=`uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;
varying vec3 vWorldDirection;
void main() {
	vec4 texColor = textureCube( tCube, vec3( tFlip * vWorldDirection.x, vWorldDirection.yz ) );
	gl_FragColor = texColor;
	gl_FragColor.a *= opacity;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,cg=`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
varying vec2 vHighPrecisionZW;
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vHighPrecisionZW = gl_Position.zw;
}`,hg=`#if DEPTH_PACKING == 3200
	uniform float opacity;
#endif
#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
varying vec2 vHighPrecisionZW;
void main() {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#if DEPTH_PACKING == 3200
		diffuseColor.a = opacity;
	#endif
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <logdepthbuf_fragment>
	#ifdef USE_REVERSED_DEPTH_BUFFER
		float fragCoordZ = vHighPrecisionZW[ 0 ] / vHighPrecisionZW[ 1 ];
	#else
		float fragCoordZ = 0.5 * vHighPrecisionZW[ 0 ] / vHighPrecisionZW[ 1 ] + 0.5;
	#endif
	#if DEPTH_PACKING == 3200
		gl_FragColor = vec4( vec3( 1.0 - fragCoordZ ), opacity );
	#elif DEPTH_PACKING == 3201
		gl_FragColor = packDepthToRGBA( fragCoordZ );
	#elif DEPTH_PACKING == 3202
		gl_FragColor = vec4( packDepthToRGB( fragCoordZ ), 1.0 );
	#elif DEPTH_PACKING == 3203
		gl_FragColor = vec4( packDepthToRG( fragCoordZ ), 0.0, 1.0 );
	#endif
}`,ug=`#define DISTANCE
varying vec3 vWorldPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <worldpos_vertex>
	#include <clipping_planes_vertex>
	vWorldPosition = worldPosition.xyz;
}`,dg=`#define DISTANCE
uniform vec3 referencePosition;
uniform float nearDistance;
uniform float farDistance;
varying vec3 vWorldPosition;
#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <clipping_planes_pars_fragment>
void main () {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	float dist = length( vWorldPosition - referencePosition );
	dist = ( dist - nearDistance ) / ( farDistance - nearDistance );
	dist = saturate( dist );
	gl_FragColor = packDepthToRGBA( dist );
}`,fg=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
}`,pg=`uniform sampler2D tEquirect;
varying vec3 vWorldDirection;
#include <common>
void main() {
	vec3 direction = normalize( vWorldDirection );
	vec2 sampleUV = equirectUv( direction );
	gl_FragColor = texture2D( tEquirect, sampleUV );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,mg=`uniform float scale;
attribute float lineDistance;
varying float vLineDistance;
#include <common>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	vLineDistance = scale * lineDistance;
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,gg=`uniform vec3 diffuse;
uniform float opacity;
uniform float dashSize;
uniform float totalSize;
varying float vLineDistance;
#include <common>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	if ( mod( vLineDistance, totalSize ) > dashSize ) {
		discard;
	}
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,vg=`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#if defined ( USE_ENVMAP ) || defined ( USE_SKINNING )
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinbase_vertex>
		#include <skinnormal_vertex>
		#include <defaultnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <fog_vertex>
}`,Sg=`uniform vec3 diffuse;
uniform float opacity;
#ifndef FLAT_SHADED
	varying vec3 vNormal;
#endif
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		reflectedLight.indirectDiffuse += lightMapTexel.rgb * lightMapIntensity * RECIPROCAL_PI;
	#else
		reflectedLight.indirectDiffuse += vec3( 1.0 );
	#endif
	#include <aomap_fragment>
	reflectedLight.indirectDiffuse *= diffuseColor.rgb;
	vec3 outgoingLight = reflectedLight.indirectDiffuse;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,xg=`#define LAMBERT
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,_g=`#define LAMBERT
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_lambert_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_lambert_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,yg=`#define MATCAP
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <displacementmap_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
	vViewPosition = - mvPosition.xyz;
}`,Mg=`#define MATCAP
uniform vec3 diffuse;
uniform float opacity;
uniform sampler2D matcap;
varying vec3 vViewPosition;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	vec3 viewDir = normalize( vViewPosition );
	vec3 x = normalize( vec3( viewDir.z, 0.0, - viewDir.x ) );
	vec3 y = cross( viewDir, x );
	vec2 uv = vec2( dot( x, normal ), dot( y, normal ) ) * 0.495 + 0.5;
	#ifdef USE_MATCAP
		vec4 matcapColor = texture2D( matcap, uv );
	#else
		vec4 matcapColor = vec4( vec3( mix( 0.2, 0.8, uv.y ) ), 1.0 );
	#endif
	vec3 outgoingLight = diffuseColor.rgb * matcapColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,bg=`#define NORMAL
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	vViewPosition = - mvPosition.xyz;
#endif
}`,Rg=`#define NORMAL
uniform float opacity;
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <packing>
#include <uv_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( 0.0, 0.0, 0.0, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	gl_FragColor = vec4( packNormalToRGB( normal ), diffuseColor.a );
	#ifdef OPAQUE
		gl_FragColor.a = 1.0;
	#endif
}`,wg=`#define PHONG
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,Eg=`#define PHONG
uniform vec3 diffuse;
uniform vec3 emissive;
uniform vec3 specular;
uniform float shininess;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_phong_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_phong_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + reflectedLight.directSpecular + reflectedLight.indirectSpecular + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,Tg=`#define STANDARD
varying vec3 vViewPosition;
#ifdef USE_TRANSMISSION
	varying vec3 vWorldPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
#ifdef USE_TRANSMISSION
	vWorldPosition = worldPosition.xyz;
#endif
}`,Cg=`#define STANDARD
#ifdef PHYSICAL
	#define IOR
	#define USE_SPECULAR
#endif
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float roughness;
uniform float metalness;
uniform float opacity;
#ifdef IOR
	uniform float ior;
#endif
#ifdef USE_SPECULAR
	uniform float specularIntensity;
	uniform vec3 specularColor;
	#ifdef USE_SPECULAR_COLORMAP
		uniform sampler2D specularColorMap;
	#endif
	#ifdef USE_SPECULAR_INTENSITYMAP
		uniform sampler2D specularIntensityMap;
	#endif
#endif
#ifdef USE_CLEARCOAT
	uniform float clearcoat;
	uniform float clearcoatRoughness;
#endif
#ifdef USE_DISPERSION
	uniform float dispersion;
#endif
#ifdef USE_IRIDESCENCE
	uniform float iridescence;
	uniform float iridescenceIOR;
	uniform float iridescenceThicknessMinimum;
	uniform float iridescenceThicknessMaximum;
#endif
#ifdef USE_SHEEN
	uniform vec3 sheenColor;
	uniform float sheenRoughness;
	#ifdef USE_SHEEN_COLORMAP
		uniform sampler2D sheenColorMap;
	#endif
	#ifdef USE_SHEEN_ROUGHNESSMAP
		uniform sampler2D sheenRoughnessMap;
	#endif
#endif
#ifdef USE_ANISOTROPY
	uniform vec2 anisotropyVector;
	#ifdef USE_ANISOTROPYMAP
		uniform sampler2D anisotropyMap;
	#endif
#endif
varying vec3 vViewPosition;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <iridescence_fragment>
#include <cube_uv_reflection_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_physical_pars_fragment>
#include <transmission_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <clearcoat_pars_fragment>
#include <iridescence_pars_fragment>
#include <roughnessmap_pars_fragment>
#include <metalnessmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <roughnessmap_fragment>
	#include <metalnessmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <clearcoat_normal_fragment_begin>
	#include <clearcoat_normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_physical_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 totalDiffuse = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse;
	vec3 totalSpecular = reflectedLight.directSpecular + reflectedLight.indirectSpecular;
	#include <transmission_fragment>
	vec3 outgoingLight = totalDiffuse + totalSpecular + totalEmissiveRadiance;
	#ifdef USE_SHEEN
		float sheenEnergyComp = 1.0 - 0.157 * max3( material.sheenColor );
		outgoingLight = outgoingLight * sheenEnergyComp + sheenSpecularDirect + sheenSpecularIndirect;
	#endif
	#ifdef USE_CLEARCOAT
		float dotNVcc = saturate( dot( geometryClearcoatNormal, geometryViewDir ) );
		vec3 Fcc = F_Schlick( material.clearcoatF0, material.clearcoatF90, dotNVcc );
		outgoingLight = outgoingLight * ( 1.0 - material.clearcoat * Fcc ) + ( clearcoatSpecularDirect + clearcoatSpecularIndirect ) * material.clearcoat;
	#endif
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,Ag=`#define TOON
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,Lg=`#define TOON
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <gradientmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_toon_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_toon_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,Pg=`uniform float size;
uniform float scale;
#include <common>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
#ifdef USE_POINTS_UV
	varying vec2 vUv;
	uniform mat3 uvTransform;
#endif
void main() {
	#ifdef USE_POINTS_UV
		vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	#endif
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	gl_PointSize = size;
	#ifdef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) gl_PointSize *= ( scale / - mvPosition.z );
	#endif
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <fog_vertex>
}`,Fg=`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <color_pars_fragment>
#include <map_particle_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_particle_fragment>
	#include <color_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,Ig=`#include <common>
#include <batching_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <shadowmap_pars_vertex>
void main() {
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,Dg=`uniform vec3 color;
uniform float opacity;
#include <common>
#include <packing>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <logdepthbuf_pars_fragment>
#include <shadowmap_pars_fragment>
#include <shadowmask_pars_fragment>
void main() {
	#include <logdepthbuf_fragment>
	gl_FragColor = vec4( color, opacity * ( 1.0 - getShadowMask() ) );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
}`,Bg=`uniform float rotation;
uniform vec2 center;
#include <common>
#include <uv_pars_vertex>
#include <fog_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	vec4 mvPosition = modelViewMatrix[ 3 ];
	vec2 scale = vec2( length( modelMatrix[ 0 ].xyz ), length( modelMatrix[ 1 ].xyz ) );
	#ifndef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) scale *= - mvPosition.z;
	#endif
	vec2 alignedPosition = ( position.xy - ( center - vec2( 0.5 ) ) ) * scale;
	vec2 rotatedPosition;
	rotatedPosition.x = cos( rotation ) * alignedPosition.x - sin( rotation ) * alignedPosition.y;
	rotatedPosition.y = sin( rotation ) * alignedPosition.x + cos( rotation ) * alignedPosition.y;
	mvPosition.xy += rotatedPosition;
	gl_Position = projectionMatrix * mvPosition;
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,Ug=`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
}`,Ht={alphahash_fragment:sm,alphahash_pars_fragment:rm,alphamap_fragment:am,alphamap_pars_fragment:om,alphatest_fragment:lm,alphatest_pars_fragment:cm,aomap_fragment:hm,aomap_pars_fragment:um,batching_pars_vertex:dm,batching_vertex:fm,begin_vertex:pm,beginnormal_vertex:mm,bsdfs:gm,iridescence_fragment:vm,bumpmap_pars_fragment:Sm,clipping_planes_fragment:xm,clipping_planes_pars_fragment:_m,clipping_planes_pars_vertex:ym,clipping_planes_vertex:Mm,color_fragment:bm,color_pars_fragment:Rm,color_pars_vertex:wm,color_vertex:Em,common:Tm,cube_uv_reflection_fragment:Cm,defaultnormal_vertex:Am,displacementmap_pars_vertex:Lm,displacementmap_vertex:Pm,emissivemap_fragment:Fm,emissivemap_pars_fragment:Im,colorspace_fragment:Dm,colorspace_pars_fragment:Bm,envmap_fragment:Um,envmap_common_pars_fragment:Nm,envmap_pars_fragment:Om,envmap_pars_vertex:zm,envmap_physical_pars_fragment:Km,envmap_vertex:km,fog_vertex:Hm,fog_pars_vertex:Gm,fog_fragment:Vm,fog_pars_fragment:Wm,gradientmap_pars_fragment:$m,lightmap_pars_fragment:Xm,lights_lambert_fragment:qm,lights_lambert_pars_fragment:Ym,lights_pars_begin:Jm,lights_toon_fragment:Zm,lights_toon_pars_fragment:jm,lights_phong_fragment:Qm,lights_phong_pars_fragment:t0,lights_physical_fragment:e0,lights_physical_pars_fragment:n0,lights_fragment_begin:i0,lights_fragment_maps:s0,lights_fragment_end:r0,logdepthbuf_fragment:a0,logdepthbuf_pars_fragment:o0,logdepthbuf_pars_vertex:l0,logdepthbuf_vertex:c0,map_fragment:h0,map_pars_fragment:u0,map_particle_fragment:d0,map_particle_pars_fragment:f0,metalnessmap_fragment:p0,metalnessmap_pars_fragment:m0,morphinstance_vertex:g0,morphcolor_vertex:v0,morphnormal_vertex:S0,morphtarget_pars_vertex:x0,morphtarget_vertex:_0,normal_fragment_begin:y0,normal_fragment_maps:M0,normal_pars_fragment:b0,normal_pars_vertex:R0,normal_vertex:w0,normalmap_pars_fragment:E0,clearcoat_normal_fragment_begin:T0,clearcoat_normal_fragment_maps:C0,clearcoat_pars_fragment:A0,iridescence_pars_fragment:L0,opaque_fragment:P0,packing:F0,premultiplied_alpha_fragment:I0,project_vertex:D0,dithering_fragment:B0,dithering_pars_fragment:U0,roughnessmap_fragment:N0,roughnessmap_pars_fragment:O0,shadowmap_pars_fragment:z0,shadowmap_pars_vertex:k0,shadowmap_vertex:H0,shadowmask_pars_fragment:G0,skinbase_vertex:V0,skinning_pars_vertex:W0,skinning_vertex:$0,skinnormal_vertex:X0,specularmap_fragment:q0,specularmap_pars_fragment:Y0,tonemapping_fragment:J0,tonemapping_pars_fragment:K0,transmission_fragment:Z0,transmission_pars_fragment:j0,uv_pars_fragment:Q0,uv_pars_vertex:tg,uv_vertex:eg,worldpos_vertex:ng,background_vert:ig,background_frag:sg,backgroundCube_vert:rg,backgroundCube_frag:ag,cube_vert:og,cube_frag:lg,depth_vert:cg,depth_frag:hg,distanceRGBA_vert:ug,distanceRGBA_frag:dg,equirect_vert:fg,equirect_frag:pg,linedashed_vert:mg,linedashed_frag:gg,meshbasic_vert:vg,meshbasic_frag:Sg,meshlambert_vert:xg,meshlambert_frag:_g,meshmatcap_vert:yg,meshmatcap_frag:Mg,meshnormal_vert:bg,meshnormal_frag:Rg,meshphong_vert:wg,meshphong_frag:Eg,meshphysical_vert:Tg,meshphysical_frag:Cg,meshtoon_vert:Ag,meshtoon_frag:Lg,points_vert:Pg,points_frag:Fg,shadow_vert:Ig,shadow_frag:Dg,sprite_vert:Bg,sprite_frag:Ug},ct={common:{diffuse:{value:new Nt(16777215)},opacity:{value:1},map:{value:null},mapTransform:{value:new zt},alphaMap:{value:null},alphaMapTransform:{value:new zt},alphaTest:{value:0}},specularmap:{specularMap:{value:null},specularMapTransform:{value:new zt}},envmap:{envMap:{value:null},envMapRotation:{value:new zt},flipEnvMap:{value:-1},reflectivity:{value:1},ior:{value:1.5},refractionRatio:{value:.98}},aomap:{aoMap:{value:null},aoMapIntensity:{value:1},aoMapTransform:{value:new zt}},lightmap:{lightMap:{value:null},lightMapIntensity:{value:1},lightMapTransform:{value:new zt}},bumpmap:{bumpMap:{value:null},bumpMapTransform:{value:new zt},bumpScale:{value:1}},normalmap:{normalMap:{value:null},normalMapTransform:{value:new zt},normalScale:{value:new ft(1,1)}},displacementmap:{displacementMap:{value:null},displacementMapTransform:{value:new zt},displacementScale:{value:1},displacementBias:{value:0}},emissivemap:{emissiveMap:{value:null},emissiveMapTransform:{value:new zt}},metalnessmap:{metalnessMap:{value:null},metalnessMapTransform:{value:new zt}},roughnessmap:{roughnessMap:{value:null},roughnessMapTransform:{value:new zt}},gradientmap:{gradientMap:{value:null}},fog:{fogDensity:{value:25e-5},fogNear:{value:1},fogFar:{value:2e3},fogColor:{value:new Nt(16777215)}},lights:{ambientLightColor:{value:[]},lightProbe:{value:[]},directionalLights:{value:[],properties:{direction:{},color:{}}},directionalLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},directionalShadowMap:{value:[]},directionalShadowMatrix:{value:[]},spotLights:{value:[],properties:{color:{},position:{},direction:{},distance:{},coneCos:{},penumbraCos:{},decay:{}}},spotLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},spotLightMap:{value:[]},spotShadowMap:{value:[]},spotLightMatrix:{value:[]},pointLights:{value:[],properties:{color:{},position:{},decay:{},distance:{}}},pointLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{},shadowCameraNear:{},shadowCameraFar:{}}},pointShadowMap:{value:[]},pointShadowMatrix:{value:[]},hemisphereLights:{value:[],properties:{direction:{},skyColor:{},groundColor:{}}},rectAreaLights:{value:[],properties:{color:{},position:{},width:{},height:{}}},ltc_1:{value:null},ltc_2:{value:null}},points:{diffuse:{value:new Nt(16777215)},opacity:{value:1},size:{value:1},scale:{value:1},map:{value:null},alphaMap:{value:null},alphaMapTransform:{value:new zt},alphaTest:{value:0},uvTransform:{value:new zt}},sprite:{diffuse:{value:new Nt(16777215)},opacity:{value:1},center:{value:new ft(.5,.5)},rotation:{value:0},map:{value:null},mapTransform:{value:new zt},alphaMap:{value:null},alphaMapTransform:{value:new zt},alphaTest:{value:0}}},pn={basic:{uniforms:Ne([ct.common,ct.specularmap,ct.envmap,ct.aomap,ct.lightmap,ct.fog]),vertexShader:Ht.meshbasic_vert,fragmentShader:Ht.meshbasic_frag},lambert:{uniforms:Ne([ct.common,ct.specularmap,ct.envmap,ct.aomap,ct.lightmap,ct.emissivemap,ct.bumpmap,ct.normalmap,ct.displacementmap,ct.fog,ct.lights,{emissive:{value:new Nt(0)}}]),vertexShader:Ht.meshlambert_vert,fragmentShader:Ht.meshlambert_frag},phong:{uniforms:Ne([ct.common,ct.specularmap,ct.envmap,ct.aomap,ct.lightmap,ct.emissivemap,ct.bumpmap,ct.normalmap,ct.displacementmap,ct.fog,ct.lights,{emissive:{value:new Nt(0)},specular:{value:new Nt(1118481)},shininess:{value:30}}]),vertexShader:Ht.meshphong_vert,fragmentShader:Ht.meshphong_frag},standard:{uniforms:Ne([ct.common,ct.envmap,ct.aomap,ct.lightmap,ct.emissivemap,ct.bumpmap,ct.normalmap,ct.displacementmap,ct.roughnessmap,ct.metalnessmap,ct.fog,ct.lights,{emissive:{value:new Nt(0)},roughness:{value:1},metalness:{value:0},envMapIntensity:{value:1}}]),vertexShader:Ht.meshphysical_vert,fragmentShader:Ht.meshphysical_frag},toon:{uniforms:Ne([ct.common,ct.aomap,ct.lightmap,ct.emissivemap,ct.bumpmap,ct.normalmap,ct.displacementmap,ct.gradientmap,ct.fog,ct.lights,{emissive:{value:new Nt(0)}}]),vertexShader:Ht.meshtoon_vert,fragmentShader:Ht.meshtoon_frag},matcap:{uniforms:Ne([ct.common,ct.bumpmap,ct.normalmap,ct.displacementmap,ct.fog,{matcap:{value:null}}]),vertexShader:Ht.meshmatcap_vert,fragmentShader:Ht.meshmatcap_frag},points:{uniforms:Ne([ct.points,ct.fog]),vertexShader:Ht.points_vert,fragmentShader:Ht.points_frag},dashed:{uniforms:Ne([ct.common,ct.fog,{scale:{value:1},dashSize:{value:1},totalSize:{value:2}}]),vertexShader:Ht.linedashed_vert,fragmentShader:Ht.linedashed_frag},depth:{uniforms:Ne([ct.common,ct.displacementmap]),vertexShader:Ht.depth_vert,fragmentShader:Ht.depth_frag},normal:{uniforms:Ne([ct.common,ct.bumpmap,ct.normalmap,ct.displacementmap,{opacity:{value:1}}]),vertexShader:Ht.meshnormal_vert,fragmentShader:Ht.meshnormal_frag},sprite:{uniforms:Ne([ct.sprite,ct.fog]),vertexShader:Ht.sprite_vert,fragmentShader:Ht.sprite_frag},background:{uniforms:{uvTransform:{value:new zt},t2D:{value:null},backgroundIntensity:{value:1}},vertexShader:Ht.background_vert,fragmentShader:Ht.background_frag},backgroundCube:{uniforms:{envMap:{value:null},flipEnvMap:{value:-1},backgroundBlurriness:{value:0},backgroundIntensity:{value:1},backgroundRotation:{value:new zt}},vertexShader:Ht.backgroundCube_vert,fragmentShader:Ht.backgroundCube_frag},cube:{uniforms:{tCube:{value:null},tFlip:{value:-1},opacity:{value:1}},vertexShader:Ht.cube_vert,fragmentShader:Ht.cube_frag},equirect:{uniforms:{tEquirect:{value:null}},vertexShader:Ht.equirect_vert,fragmentShader:Ht.equirect_frag},distanceRGBA:{uniforms:Ne([ct.common,ct.displacementmap,{referencePosition:{value:new B},nearDistance:{value:1},farDistance:{value:1e3}}]),vertexShader:Ht.distanceRGBA_vert,fragmentShader:Ht.distanceRGBA_frag},shadow:{uniforms:Ne([ct.lights,ct.fog,{color:{value:new Nt(0)},opacity:{value:1}}]),vertexShader:Ht.shadow_vert,fragmentShader:Ht.shadow_frag}};pn.physical={uniforms:Ne([pn.standard.uniforms,{clearcoat:{value:0},clearcoatMap:{value:null},clearcoatMapTransform:{value:new zt},clearcoatNormalMap:{value:null},clearcoatNormalMapTransform:{value:new zt},clearcoatNormalScale:{value:new ft(1,1)},clearcoatRoughness:{value:0},clearcoatRoughnessMap:{value:null},clearcoatRoughnessMapTransform:{value:new zt},dispersion:{value:0},iridescence:{value:0},iridescenceMap:{value:null},iridescenceMapTransform:{value:new zt},iridescenceIOR:{value:1.3},iridescenceThicknessMinimum:{value:100},iridescenceThicknessMaximum:{value:400},iridescenceThicknessMap:{value:null},iridescenceThicknessMapTransform:{value:new zt},sheen:{value:0},sheenColor:{value:new Nt(0)},sheenColorMap:{value:null},sheenColorMapTransform:{value:new zt},sheenRoughness:{value:1},sheenRoughnessMap:{value:null},sheenRoughnessMapTransform:{value:new zt},transmission:{value:0},transmissionMap:{value:null},transmissionMapTransform:{value:new zt},transmissionSamplerSize:{value:new ft},transmissionSamplerMap:{value:null},thickness:{value:0},thicknessMap:{value:null},thicknessMapTransform:{value:new zt},attenuationDistance:{value:0},attenuationColor:{value:new Nt(0)},specularColor:{value:new Nt(1,1,1)},specularColorMap:{value:null},specularColorMapTransform:{value:new zt},specularIntensity:{value:1},specularIntensityMap:{value:null},specularIntensityMapTransform:{value:new zt},anisotropyVector:{value:new ft},anisotropyMap:{value:null},anisotropyMapTransform:{value:new zt}}]),vertexShader:Ht.meshphysical_vert,fragmentShader:Ht.meshphysical_frag};const Mr={r:0,b:0,g:0},ii=new Mn,Ng=new se;function Og(i,t,e,n,s,r,a){const o=new Nt(0);let l=r===!0?0:1,c,u,h=null,d=0,f=null;function g(b){let x=b.isScene===!0?b.background:null;return x&&x.isTexture&&(x=(b.backgroundBlurriness>0?e:t).get(x)),x}function v(b){let x=!1;const E=g(b);E===null?p(o,l):E&&E.isColor&&(p(E,1),x=!0);const T=i.xr.getEnvironmentBlendMode();T==="additive"?n.buffers.color.setClear(0,0,0,1,a):T==="alpha-blend"&&n.buffers.color.setClear(0,0,0,0,a),(i.autoClear||x)&&(n.buffers.depth.setTest(!0),n.buffers.depth.setMask(!0),n.buffers.color.setMask(!0),i.clear(i.autoClearColor,i.autoClearDepth,i.autoClearStencil))}function m(b,x){const E=g(x);E&&(E.isCubeTexture||E.mapping===jr)?(u===void 0&&(u=new Mt(new je(1,1,1),new Jn({name:"BackgroundCubeMaterial",uniforms:ns(pn.backgroundCube.uniforms),vertexShader:pn.backgroundCube.vertexShader,fragmentShader:pn.backgroundCube.fragmentShader,side:Ie,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),u.geometry.deleteAttribute("normal"),u.geometry.deleteAttribute("uv"),u.onBeforeRender=function(T,C,A){this.matrixWorld.copyPosition(A.matrixWorld)},Object.defineProperty(u.material,"envMap",{get:function(){return this.uniforms.envMap.value}}),s.update(u)),ii.copy(x.backgroundRotation),ii.x*=-1,ii.y*=-1,ii.z*=-1,E.isCubeTexture&&E.isRenderTargetTexture===!1&&(ii.y*=-1,ii.z*=-1),u.material.uniforms.envMap.value=E,u.material.uniforms.flipEnvMap.value=E.isCubeTexture&&E.isRenderTargetTexture===!1?-1:1,u.material.uniforms.backgroundBlurriness.value=x.backgroundBlurriness,u.material.uniforms.backgroundIntensity.value=x.backgroundIntensity,u.material.uniforms.backgroundRotation.value.setFromMatrix4(Ng.makeRotationFromEuler(ii)),u.material.toneMapped=Kt.getTransfer(E.colorSpace)!==ae,(h!==E||d!==E.version||f!==i.toneMapping)&&(u.material.needsUpdate=!0,h=E,d=E.version,f=i.toneMapping),u.layers.enableAll(),b.unshift(u,u.geometry,u.material,0,0,null)):E&&E.isTexture&&(c===void 0&&(c=new Mt(new on(2,2),new Jn({name:"BackgroundMaterial",uniforms:ns(pn.background.uniforms),vertexShader:pn.background.vertexShader,fragmentShader:pn.background.fragmentShader,side:Yn,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),c.geometry.deleteAttribute("normal"),Object.defineProperty(c.material,"map",{get:function(){return this.uniforms.t2D.value}}),s.update(c)),c.material.uniforms.t2D.value=E,c.material.uniforms.backgroundIntensity.value=x.backgroundIntensity,c.material.toneMapped=Kt.getTransfer(E.colorSpace)!==ae,E.matrixAutoUpdate===!0&&E.updateMatrix(),c.material.uniforms.uvTransform.value.copy(E.matrix),(h!==E||d!==E.version||f!==i.toneMapping)&&(c.material.needsUpdate=!0,h=E,d=E.version,f=i.toneMapping),c.layers.enableAll(),b.unshift(c,c.geometry,c.material,0,0,null))}function p(b,x){b.getRGB(Mr,kh(i)),n.buffers.color.setClear(Mr.r,Mr.g,Mr.b,x,a)}function M(){u!==void 0&&(u.geometry.dispose(),u.material.dispose(),u=void 0),c!==void 0&&(c.geometry.dispose(),c.material.dispose(),c=void 0)}return{getClearColor:function(){return o},setClearColor:function(b,x=1){o.set(b),l=x,p(o,l)},getClearAlpha:function(){return l},setClearAlpha:function(b){l=b,p(o,l)},render:v,addToRenderList:m,dispose:M}}function zg(i,t){const e=i.getParameter(i.MAX_VERTEX_ATTRIBS),n={},s=d(null);let r=s,a=!1;function o(y,L,U,z,$){let X=!1;const q=h(z,U,L);r!==q&&(r=q,c(r.object)),X=f(y,z,U,$),X&&g(y,z,U,$),$!==null&&t.update($,i.ELEMENT_ARRAY_BUFFER),(X||a)&&(a=!1,x(y,L,U,z),$!==null&&i.bindBuffer(i.ELEMENT_ARRAY_BUFFER,t.get($).buffer))}function l(){return i.createVertexArray()}function c(y){return i.bindVertexArray(y)}function u(y){return i.deleteVertexArray(y)}function h(y,L,U){const z=U.wireframe===!0;let $=n[y.id];$===void 0&&($={},n[y.id]=$);let X=$[L.id];X===void 0&&(X={},$[L.id]=X);let q=X[z];return q===void 0&&(q=d(l()),X[z]=q),q}function d(y){const L=[],U=[],z=[];for(let $=0;$<e;$++)L[$]=0,U[$]=0,z[$]=0;return{geometry:null,program:null,wireframe:!1,newAttributes:L,enabledAttributes:U,attributeDivisors:z,object:y,attributes:{},index:null}}function f(y,L,U,z){const $=r.attributes,X=L.attributes;let q=0;const Z=U.getAttributes();for(const W in Z)if(Z[W].location>=0){const ut=$[W];let Et=X[W];if(Et===void 0&&(W==="instanceMatrix"&&y.instanceMatrix&&(Et=y.instanceMatrix),W==="instanceColor"&&y.instanceColor&&(Et=y.instanceColor)),ut===void 0||ut.attribute!==Et||Et&&ut.data!==Et.data)return!0;q++}return r.attributesNum!==q||r.index!==z}function g(y,L,U,z){const $={},X=L.attributes;let q=0;const Z=U.getAttributes();for(const W in Z)if(Z[W].location>=0){let ut=X[W];ut===void 0&&(W==="instanceMatrix"&&y.instanceMatrix&&(ut=y.instanceMatrix),W==="instanceColor"&&y.instanceColor&&(ut=y.instanceColor));const Et={};Et.attribute=ut,ut&&ut.data&&(Et.data=ut.data),$[W]=Et,q++}r.attributes=$,r.attributesNum=q,r.index=z}function v(){const y=r.newAttributes;for(let L=0,U=y.length;L<U;L++)y[L]=0}function m(y){p(y,0)}function p(y,L){const U=r.newAttributes,z=r.enabledAttributes,$=r.attributeDivisors;U[y]=1,z[y]===0&&(i.enableVertexAttribArray(y),z[y]=1),$[y]!==L&&(i.vertexAttribDivisor(y,L),$[y]=L)}function M(){const y=r.newAttributes,L=r.enabledAttributes;for(let U=0,z=L.length;U<z;U++)L[U]!==y[U]&&(i.disableVertexAttribArray(U),L[U]=0)}function b(y,L,U,z,$,X,q){q===!0?i.vertexAttribIPointer(y,L,U,$,X):i.vertexAttribPointer(y,L,U,z,$,X)}function x(y,L,U,z){v();const $=z.attributes,X=U.getAttributes(),q=L.defaultAttributeValues;for(const Z in X){const W=X[Z];if(W.location>=0){let rt=$[Z];if(rt===void 0&&(Z==="instanceMatrix"&&y.instanceMatrix&&(rt=y.instanceMatrix),Z==="instanceColor"&&y.instanceColor&&(rt=y.instanceColor)),rt!==void 0){const ut=rt.normalized,Et=rt.itemSize,kt=t.get(rt);if(kt===void 0)continue;const Zt=kt.buffer,ee=kt.type,Yt=kt.bytesPerElement,K=ee===i.INT||ee===i.UNSIGNED_INT||rt.gpuType===tl;if(rt.isInterleavedBufferAttribute){const j=rt.data,mt=j.stride,Pt=rt.offset;if(j.isInstancedInterleavedBuffer){for(let gt=0;gt<W.locationSize;gt++)p(W.location+gt,j.meshPerAttribute);y.isInstancedMesh!==!0&&z._maxInstanceCount===void 0&&(z._maxInstanceCount=j.meshPerAttribute*j.count)}else for(let gt=0;gt<W.locationSize;gt++)m(W.location+gt);i.bindBuffer(i.ARRAY_BUFFER,Zt);for(let gt=0;gt<W.locationSize;gt++)b(W.location+gt,Et/W.locationSize,ee,ut,mt*Yt,(Pt+Et/W.locationSize*gt)*Yt,K)}else{if(rt.isInstancedBufferAttribute){for(let j=0;j<W.locationSize;j++)p(W.location+j,rt.meshPerAttribute);y.isInstancedMesh!==!0&&z._maxInstanceCount===void 0&&(z._maxInstanceCount=rt.meshPerAttribute*rt.count)}else for(let j=0;j<W.locationSize;j++)m(W.location+j);i.bindBuffer(i.ARRAY_BUFFER,Zt);for(let j=0;j<W.locationSize;j++)b(W.location+j,Et/W.locationSize,ee,ut,Et*Yt,Et/W.locationSize*j*Yt,K)}}else if(q!==void 0){const ut=q[Z];if(ut!==void 0)switch(ut.length){case 2:i.vertexAttrib2fv(W.location,ut);break;case 3:i.vertexAttrib3fv(W.location,ut);break;case 4:i.vertexAttrib4fv(W.location,ut);break;default:i.vertexAttrib1fv(W.location,ut)}}}}M()}function E(){A();for(const y in n){const L=n[y];for(const U in L){const z=L[U];for(const $ in z)u(z[$].object),delete z[$];delete L[U]}delete n[y]}}function T(y){if(n[y.id]===void 0)return;const L=n[y.id];for(const U in L){const z=L[U];for(const $ in z)u(z[$].object),delete z[$];delete L[U]}delete n[y.id]}function C(y){for(const L in n){const U=n[L];if(U[y.id]===void 0)continue;const z=U[y.id];for(const $ in z)u(z[$].object),delete z[$];delete U[y.id]}}function A(){_(),a=!0,r!==s&&(r=s,c(r.object))}function _(){s.geometry=null,s.program=null,s.wireframe=!1}return{setup:o,reset:A,resetDefaultState:_,dispose:E,releaseStatesOfGeometry:T,releaseStatesOfProgram:C,initAttributes:v,enableAttribute:m,disableUnusedAttributes:M}}function kg(i,t,e){let n;function s(c){n=c}function r(c,u){i.drawArrays(n,c,u),e.update(u,n,1)}function a(c,u,h){h!==0&&(i.drawArraysInstanced(n,c,u,h),e.update(u,n,h))}function o(c,u,h){if(h===0)return;t.get("WEBGL_multi_draw").multiDrawArraysWEBGL(n,c,0,u,0,h);let f=0;for(let g=0;g<h;g++)f+=u[g];e.update(f,n,1)}function l(c,u,h,d){if(h===0)return;const f=t.get("WEBGL_multi_draw");if(f===null)for(let g=0;g<c.length;g++)a(c[g],u[g],d[g]);else{f.multiDrawArraysInstancedWEBGL(n,c,0,u,0,d,0,h);let g=0;for(let v=0;v<h;v++)g+=u[v]*d[v];e.update(g,n,1)}}this.setMode=s,this.render=r,this.renderInstances=a,this.renderMultiDraw=o,this.renderMultiDrawInstances=l}function Hg(i,t,e,n){let s;function r(){if(s!==void 0)return s;if(t.has("EXT_texture_filter_anisotropic")===!0){const C=t.get("EXT_texture_filter_anisotropic");s=i.getParameter(C.MAX_TEXTURE_MAX_ANISOTROPY_EXT)}else s=0;return s}function a(C){return!(C!==dn&&n.convert(C)!==i.getParameter(i.IMPLEMENTATION_COLOR_READ_FORMAT))}function o(C){const A=C===Gs&&(t.has("EXT_color_buffer_half_float")||t.has("EXT_color_buffer_float"));return!(C!==yn&&n.convert(C)!==i.getParameter(i.IMPLEMENTATION_COLOR_READ_TYPE)&&C!==vn&&!A)}function l(C){if(C==="highp"){if(i.getShaderPrecisionFormat(i.VERTEX_SHADER,i.HIGH_FLOAT).precision>0&&i.getShaderPrecisionFormat(i.FRAGMENT_SHADER,i.HIGH_FLOAT).precision>0)return"highp";C="mediump"}return C==="mediump"&&i.getShaderPrecisionFormat(i.VERTEX_SHADER,i.MEDIUM_FLOAT).precision>0&&i.getShaderPrecisionFormat(i.FRAGMENT_SHADER,i.MEDIUM_FLOAT).precision>0?"mediump":"lowp"}let c=e.precision!==void 0?e.precision:"highp";const u=l(c);u!==c&&(console.warn("THREE.WebGLRenderer:",c,"not supported, using",u,"instead."),c=u);const h=e.logarithmicDepthBuffer===!0,d=e.reversedDepthBuffer===!0&&t.has("EXT_clip_control"),f=i.getParameter(i.MAX_TEXTURE_IMAGE_UNITS),g=i.getParameter(i.MAX_VERTEX_TEXTURE_IMAGE_UNITS),v=i.getParameter(i.MAX_TEXTURE_SIZE),m=i.getParameter(i.MAX_CUBE_MAP_TEXTURE_SIZE),p=i.getParameter(i.MAX_VERTEX_ATTRIBS),M=i.getParameter(i.MAX_VERTEX_UNIFORM_VECTORS),b=i.getParameter(i.MAX_VARYING_VECTORS),x=i.getParameter(i.MAX_FRAGMENT_UNIFORM_VECTORS),E=g>0,T=i.getParameter(i.MAX_SAMPLES);return{isWebGL2:!0,getMaxAnisotropy:r,getMaxPrecision:l,textureFormatReadable:a,textureTypeReadable:o,precision:c,logarithmicDepthBuffer:h,reversedDepthBuffer:d,maxTextures:f,maxVertexTextures:g,maxTextureSize:v,maxCubemapSize:m,maxAttributes:p,maxVertexUniforms:M,maxVaryings:b,maxFragmentUniforms:x,vertexTextures:E,maxSamples:T}}function Gg(i){const t=this;let e=null,n=0,s=!1,r=!1;const a=new kn,o=new zt,l={value:null,needsUpdate:!1};this.uniform=l,this.numPlanes=0,this.numIntersection=0,this.init=function(h,d){const f=h.length!==0||d||n!==0||s;return s=d,n=h.length,f},this.beginShadows=function(){r=!0,u(null)},this.endShadows=function(){r=!1},this.setGlobalState=function(h,d){e=u(h,d,0)},this.setState=function(h,d,f){const g=h.clippingPlanes,v=h.clipIntersection,m=h.clipShadows,p=i.get(h);if(!s||g===null||g.length===0||r&&!m)r?u(null):c();else{const M=r?0:n,b=M*4;let x=p.clippingState||null;l.value=x,x=u(g,d,b,f);for(let E=0;E!==b;++E)x[E]=e[E];p.clippingState=x,this.numIntersection=v?this.numPlanes:0,this.numPlanes+=M}};function c(){l.value!==e&&(l.value=e,l.needsUpdate=n>0),t.numPlanes=n,t.numIntersection=0}function u(h,d,f,g){const v=h!==null?h.length:0;let m=null;if(v!==0){if(m=l.value,g!==!0||m===null){const p=f+v*4,M=d.matrixWorldInverse;o.getNormalMatrix(M),(m===null||m.length<p)&&(m=new Float32Array(p));for(let b=0,x=f;b!==v;++b,x+=4)a.copy(h[b]).applyMatrix4(M,o),a.normal.toArray(m,x),m[x+3]=a.constant}l.value=m,l.needsUpdate=!0}return t.numPlanes=v,t.numIntersection=0,m}}function Vg(i){let t=new WeakMap;function e(a,o){return o===co?a.mapping=ji:o===ho&&(a.mapping=Qi),a}function n(a){if(a&&a.isTexture){const o=a.mapping;if(o===co||o===ho)if(t.has(a)){const l=t.get(a).texture;return e(l,a.mapping)}else{const l=a.image;if(l&&l.height>0){const c=new rp(l.height);return c.fromEquirectangularTexture(i,a),t.set(a,c),a.addEventListener("dispose",s),e(c.texture,a.mapping)}else return null}}return a}function s(a){const o=a.target;o.removeEventListener("dispose",s);const l=t.get(o);l!==void 0&&(t.delete(o),l.dispose())}function r(){t=new WeakMap}return{get:n,dispose:r}}const Gi=4,Cc=[.125,.215,.35,.446,.526,.582],ci=20,za=new nu,Ac=new Nt;let ka=null,Ha=0,Ga=0,Va=!1;const ai=(1+Math.sqrt(5))/2,ki=1/ai,Lc=[new B(-ai,ki,0),new B(ai,ki,0),new B(-ki,0,ai),new B(ki,0,ai),new B(0,ai,-ki),new B(0,ai,ki),new B(-1,1,-1),new B(1,1,-1),new B(-1,1,1),new B(1,1,1)],Wg=new B;class Pc{constructor(t){this._renderer=t,this._pingPongRenderTarget=null,this._lodMax=0,this._cubeSize=0,this._lodPlanes=[],this._sizeLods=[],this._sigmas=[],this._blurMaterial=null,this._cubemapMaterial=null,this._equirectMaterial=null,this._compileMaterial(this._blurMaterial)}fromScene(t,e=0,n=.1,s=100,r={}){const{size:a=256,position:o=Wg}=r;ka=this._renderer.getRenderTarget(),Ha=this._renderer.getActiveCubeFace(),Ga=this._renderer.getActiveMipmapLevel(),Va=this._renderer.xr.enabled,this._renderer.xr.enabled=!1,this._setSize(a);const l=this._allocateTargets();return l.depthBuffer=!0,this._sceneToCubeUV(t,n,s,l,o),e>0&&this._blur(l,0,0,e),this._applyPMREM(l),this._cleanup(l),l}fromEquirectangular(t,e=null){return this._fromTexture(t,e)}fromCubemap(t,e=null){return this._fromTexture(t,e)}compileCubemapShader(){this._cubemapMaterial===null&&(this._cubemapMaterial=Dc(),this._compileMaterial(this._cubemapMaterial))}compileEquirectangularShader(){this._equirectMaterial===null&&(this._equirectMaterial=Ic(),this._compileMaterial(this._equirectMaterial))}dispose(){this._dispose(),this._cubemapMaterial!==null&&this._cubemapMaterial.dispose(),this._equirectMaterial!==null&&this._equirectMaterial.dispose()}_setSize(t){this._lodMax=Math.floor(Math.log2(t)),this._cubeSize=Math.pow(2,this._lodMax)}_dispose(){this._blurMaterial!==null&&this._blurMaterial.dispose(),this._pingPongRenderTarget!==null&&this._pingPongRenderTarget.dispose();for(let t=0;t<this._lodPlanes.length;t++)this._lodPlanes[t].dispose()}_cleanup(t){this._renderer.setRenderTarget(ka,Ha,Ga),this._renderer.xr.enabled=Va,t.scissorTest=!1,br(t,0,0,t.width,t.height)}_fromTexture(t,e){t.mapping===ji||t.mapping===Qi?this._setSize(t.image.length===0?16:t.image[0].width||t.image[0].image.width):this._setSize(t.image.width/4),ka=this._renderer.getRenderTarget(),Ha=this._renderer.getActiveCubeFace(),Ga=this._renderer.getActiveMipmapLevel(),Va=this._renderer.xr.enabled,this._renderer.xr.enabled=!1;const n=e||this._allocateTargets();return this._textureToCubeUV(t,n),this._applyPMREM(n),this._cleanup(n),n}_allocateTargets(){const t=3*Math.max(this._cubeSize,112),e=4*this._cubeSize,n={magFilter:gn,minFilter:gn,generateMipmaps:!1,type:Gs,format:dn,colorSpace:es,depthBuffer:!1},s=Fc(t,e,n);if(this._pingPongRenderTarget===null||this._pingPongRenderTarget.width!==t||this._pingPongRenderTarget.height!==e){this._pingPongRenderTarget!==null&&this._dispose(),this._pingPongRenderTarget=Fc(t,e,n);const{_lodMax:r}=this;({sizeLods:this._sizeLods,lodPlanes:this._lodPlanes,sigmas:this._sigmas}=$g(r)),this._blurMaterial=Xg(r,t,e)}return s}_compileMaterial(t){const e=new Mt(this._lodPlanes[0],t);this._renderer.compile(e,za)}_sceneToCubeUV(t,e,n,s,r){const l=new rn(90,1,e,n),c=[1,-1,1,1,1,1],u=[1,1,1,-1,-1,-1],h=this._renderer,d=h.autoClear,f=h.toneMapping;h.getClearColor(Ac),h.toneMapping=Xn,h.autoClear=!1,h.state.buffers.depth.getReversed()&&(h.setRenderTarget(s),h.clearDepth(),h.setRenderTarget(null));const v=new ke({name:"PMREM.Background",side:Ie,depthWrite:!1,depthTest:!1}),m=new Mt(new je,v);let p=!1;const M=t.background;M?M.isColor&&(v.color.copy(M),t.background=null,p=!0):(v.color.copy(Ac),p=!0);for(let b=0;b<6;b++){const x=b%3;x===0?(l.up.set(0,c[b],0),l.position.set(r.x,r.y,r.z),l.lookAt(r.x+u[b],r.y,r.z)):x===1?(l.up.set(0,0,c[b]),l.position.set(r.x,r.y,r.z),l.lookAt(r.x,r.y+u[b],r.z)):(l.up.set(0,c[b],0),l.position.set(r.x,r.y,r.z),l.lookAt(r.x,r.y,r.z+u[b]));const E=this._cubeSize;br(s,x*E,b>2?E:0,E,E),h.setRenderTarget(s),p&&h.render(m,l),h.render(t,l)}m.geometry.dispose(),m.material.dispose(),h.toneMapping=f,h.autoClear=d,t.background=M}_textureToCubeUV(t,e){const n=this._renderer,s=t.mapping===ji||t.mapping===Qi;s?(this._cubemapMaterial===null&&(this._cubemapMaterial=Dc()),this._cubemapMaterial.uniforms.flipEnvMap.value=t.isRenderTargetTexture===!1?-1:1):this._equirectMaterial===null&&(this._equirectMaterial=Ic());const r=s?this._cubemapMaterial:this._equirectMaterial,a=new Mt(this._lodPlanes[0],r),o=r.uniforms;o.envMap.value=t;const l=this._cubeSize;br(e,0,0,3*l,2*l),n.setRenderTarget(e),n.render(a,za)}_applyPMREM(t){const e=this._renderer,n=e.autoClear;e.autoClear=!1;const s=this._lodPlanes.length;for(let r=1;r<s;r++){const a=Math.sqrt(this._sigmas[r]*this._sigmas[r]-this._sigmas[r-1]*this._sigmas[r-1]),o=Lc[(s-r-1)%Lc.length];this._blur(t,r-1,r,a,o)}e.autoClear=n}_blur(t,e,n,s,r){const a=this._pingPongRenderTarget;this._halfBlur(t,a,e,n,s,"latitudinal",r),this._halfBlur(a,t,n,n,s,"longitudinal",r)}_halfBlur(t,e,n,s,r,a,o){const l=this._renderer,c=this._blurMaterial;a!=="latitudinal"&&a!=="longitudinal"&&console.error("blur direction must be either latitudinal or longitudinal!");const u=3,h=new Mt(this._lodPlanes[s],c),d=c.uniforms,f=this._sizeLods[n]-1,g=isFinite(r)?Math.PI/(2*f):2*Math.PI/(2*ci-1),v=r/g,m=isFinite(r)?1+Math.floor(u*v):ci;m>ci&&console.warn(`sigmaRadians, ${r}, is too large and will clip, as it requested ${m} samples when the maximum is set to ${ci}`);const p=[];let M=0;for(let C=0;C<ci;++C){const A=C/v,_=Math.exp(-A*A/2);p.push(_),C===0?M+=_:C<m&&(M+=2*_)}for(let C=0;C<p.length;C++)p[C]=p[C]/M;d.envMap.value=t.texture,d.samples.value=m,d.weights.value=p,d.latitudinal.value=a==="latitudinal",o&&(d.poleAxis.value=o);const{_lodMax:b}=this;d.dTheta.value=g,d.mipInt.value=b-n;const x=this._sizeLods[s],E=3*x*(s>b-Gi?s-b+Gi:0),T=4*(this._cubeSize-x);br(e,E,T,3*x,2*x),l.setRenderTarget(e),l.render(h,za)}}function $g(i){const t=[],e=[],n=[];let s=i;const r=i-Gi+1+Cc.length;for(let a=0;a<r;a++){const o=Math.pow(2,s);e.push(o);let l=1/o;a>i-Gi?l=Cc[a-i+Gi-1]:a===0&&(l=0),n.push(l);const c=1/(o-2),u=-c,h=1+c,d=[u,u,h,u,h,h,u,u,h,h,u,h],f=6,g=6,v=3,m=2,p=1,M=new Float32Array(v*g*f),b=new Float32Array(m*g*f),x=new Float32Array(p*g*f);for(let T=0;T<f;T++){const C=T%3*2/3-1,A=T>2?0:-1,_=[C,A,0,C+2/3,A,0,C+2/3,A+1,0,C,A,0,C+2/3,A+1,0,C,A+1,0];M.set(_,v*g*T),b.set(d,m*g*T);const y=[T,T,T,T,T,T];x.set(y,p*g*T)}const E=new fe;E.setAttribute("position",new We(M,v)),E.setAttribute("uv",new We(b,m)),E.setAttribute("faceIndex",new We(x,p)),t.push(E),s>Gi&&s--}return{lodPlanes:t,sizeLods:e,sigmas:n}}function Fc(i,t,e){const n=new mi(i,t,e);return n.texture.mapping=jr,n.texture.name="PMREM.cubeUv",n.scissorTest=!0,n}function br(i,t,e,n,s){i.viewport.set(t,e,n,s),i.scissor.set(t,e,n,s)}function Xg(i,t,e){const n=new Float32Array(ci),s=new B(0,1,0);return new Jn({name:"SphericalGaussianBlur",defines:{n:ci,CUBEUV_TEXEL_WIDTH:1/t,CUBEUV_TEXEL_HEIGHT:1/e,CUBEUV_MAX_MIP:`${i}.0`},uniforms:{envMap:{value:null},samples:{value:1},weights:{value:n},latitudinal:{value:!1},dTheta:{value:0},mipInt:{value:0},poleAxis:{value:s}},vertexShader:ml(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;
			uniform int samples;
			uniform float weights[ n ];
			uniform bool latitudinal;
			uniform float dTheta;
			uniform float mipInt;
			uniform vec3 poleAxis;

			#define ENVMAP_TYPE_CUBE_UV
			#include <cube_uv_reflection_fragment>

			vec3 getSample( float theta, vec3 axis ) {

				float cosTheta = cos( theta );
				// Rodrigues' axis-angle rotation
				vec3 sampleDirection = vOutputDirection * cosTheta
					+ cross( axis, vOutputDirection ) * sin( theta )
					+ axis * dot( axis, vOutputDirection ) * ( 1.0 - cosTheta );

				return bilinearCubeUV( envMap, sampleDirection, mipInt );

			}

			void main() {

				vec3 axis = latitudinal ? poleAxis : cross( poleAxis, vOutputDirection );

				if ( all( equal( axis, vec3( 0.0 ) ) ) ) {

					axis = vec3( vOutputDirection.z, 0.0, - vOutputDirection.x );

				}

				axis = normalize( axis );

				gl_FragColor = vec4( 0.0, 0.0, 0.0, 1.0 );
				gl_FragColor.rgb += weights[ 0 ] * getSample( 0.0, axis );

				for ( int i = 1; i < n; i++ ) {

					if ( i >= samples ) {

						break;

					}

					float theta = dTheta * float( i );
					gl_FragColor.rgb += weights[ i ] * getSample( -1.0 * theta, axis );
					gl_FragColor.rgb += weights[ i ] * getSample( theta, axis );

				}

			}
		`,blending:$n,depthTest:!1,depthWrite:!1})}function Ic(){return new Jn({name:"EquirectangularToCubeUV",uniforms:{envMap:{value:null}},vertexShader:ml(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;

			#include <common>

			void main() {

				vec3 outputDirection = normalize( vOutputDirection );
				vec2 uv = equirectUv( outputDirection );

				gl_FragColor = vec4( texture2D ( envMap, uv ).rgb, 1.0 );

			}
		`,blending:$n,depthTest:!1,depthWrite:!1})}function Dc(){return new Jn({name:"CubemapToCubeUV",uniforms:{envMap:{value:null},flipEnvMap:{value:-1}},vertexShader:ml(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			uniform float flipEnvMap;

			varying vec3 vOutputDirection;

			uniform samplerCube envMap;

			void main() {

				gl_FragColor = textureCube( envMap, vec3( flipEnvMap * vOutputDirection.x, vOutputDirection.yz ) );

			}
		`,blending:$n,depthTest:!1,depthWrite:!1})}function ml(){return`

		precision mediump float;
		precision mediump int;

		attribute float faceIndex;

		varying vec3 vOutputDirection;

		// RH coordinate system; PMREM face-indexing convention
		vec3 getDirection( vec2 uv, float face ) {

			uv = 2.0 * uv - 1.0;

			vec3 direction = vec3( uv, 1.0 );

			if ( face == 0.0 ) {

				direction = direction.zyx; // ( 1, v, u ) pos x

			} else if ( face == 1.0 ) {

				direction = direction.xzy;
				direction.xz *= -1.0; // ( -u, 1, -v ) pos y

			} else if ( face == 2.0 ) {

				direction.x *= -1.0; // ( -u, v, 1 ) pos z

			} else if ( face == 3.0 ) {

				direction = direction.zyx;
				direction.xz *= -1.0; // ( -1, v, -u ) neg x

			} else if ( face == 4.0 ) {

				direction = direction.xzy;
				direction.xy *= -1.0; // ( -u, -1, v ) neg y

			} else if ( face == 5.0 ) {

				direction.z *= -1.0; // ( u, v, -1 ) neg z

			}

			return direction;

		}

		void main() {

			vOutputDirection = getDirection( uv, faceIndex );
			gl_Position = vec4( position, 1.0 );

		}
	`}function qg(i){let t=new WeakMap,e=null;function n(o){if(o&&o.isTexture){const l=o.mapping,c=l===co||l===ho,u=l===ji||l===Qi;if(c||u){let h=t.get(o);const d=h!==void 0?h.texture.pmremVersion:0;if(o.isRenderTargetTexture&&o.pmremVersion!==d)return e===null&&(e=new Pc(i)),h=c?e.fromEquirectangular(o,h):e.fromCubemap(o,h),h.texture.pmremVersion=o.pmremVersion,t.set(o,h),h.texture;if(h!==void 0)return h.texture;{const f=o.image;return c&&f&&f.height>0||u&&f&&s(f)?(e===null&&(e=new Pc(i)),h=c?e.fromEquirectangular(o):e.fromCubemap(o),h.texture.pmremVersion=o.pmremVersion,t.set(o,h),o.addEventListener("dispose",r),h.texture):null}}}return o}function s(o){let l=0;const c=6;for(let u=0;u<c;u++)o[u]!==void 0&&l++;return l===c}function r(o){const l=o.target;l.removeEventListener("dispose",r);const c=t.get(l);c!==void 0&&(t.delete(l),c.dispose())}function a(){t=new WeakMap,e!==null&&(e.dispose(),e=null)}return{get:n,dispose:a}}function Yg(i){const t={};function e(n){if(t[n]!==void 0)return t[n];let s;switch(n){case"WEBGL_depth_texture":s=i.getExtension("WEBGL_depth_texture")||i.getExtension("MOZ_WEBGL_depth_texture")||i.getExtension("WEBKIT_WEBGL_depth_texture");break;case"EXT_texture_filter_anisotropic":s=i.getExtension("EXT_texture_filter_anisotropic")||i.getExtension("MOZ_EXT_texture_filter_anisotropic")||i.getExtension("WEBKIT_EXT_texture_filter_anisotropic");break;case"WEBGL_compressed_texture_s3tc":s=i.getExtension("WEBGL_compressed_texture_s3tc")||i.getExtension("MOZ_WEBGL_compressed_texture_s3tc")||i.getExtension("WEBKIT_WEBGL_compressed_texture_s3tc");break;case"WEBGL_compressed_texture_pvrtc":s=i.getExtension("WEBGL_compressed_texture_pvrtc")||i.getExtension("WEBKIT_WEBGL_compressed_texture_pvrtc");break;default:s=i.getExtension(n)}return t[n]=s,s}return{has:function(n){return e(n)!==null},init:function(){e("EXT_color_buffer_float"),e("WEBGL_clip_cull_distance"),e("OES_texture_float_linear"),e("EXT_color_buffer_half_float"),e("WEBGL_multisampled_render_to_texture"),e("WEBGL_render_shared_exponent")},get:function(n){const s=e(n);return s===null&&Ns("THREE.WebGLRenderer: "+n+" extension not supported."),s}}}function Jg(i,t,e,n){const s={},r=new WeakMap;function a(h){const d=h.target;d.index!==null&&t.remove(d.index);for(const g in d.attributes)t.remove(d.attributes[g]);d.removeEventListener("dispose",a),delete s[d.id];const f=r.get(d);f&&(t.remove(f),r.delete(d)),n.releaseStatesOfGeometry(d),d.isInstancedBufferGeometry===!0&&delete d._maxInstanceCount,e.memory.geometries--}function o(h,d){return s[d.id]===!0||(d.addEventListener("dispose",a),s[d.id]=!0,e.memory.geometries++),d}function l(h){const d=h.attributes;for(const f in d)t.update(d[f],i.ARRAY_BUFFER)}function c(h){const d=[],f=h.index,g=h.attributes.position;let v=0;if(f!==null){const M=f.array;v=f.version;for(let b=0,x=M.length;b<x;b+=3){const E=M[b+0],T=M[b+1],C=M[b+2];d.push(E,T,T,C,C,E)}}else if(g!==void 0){const M=g.array;v=g.version;for(let b=0,x=M.length/3-1;b<x;b+=3){const E=b+0,T=b+1,C=b+2;d.push(E,T,T,C,C,E)}}else return;const m=new(Bh(d)?zh:Oh)(d,1);m.version=v;const p=r.get(h);p&&t.remove(p),r.set(h,m)}function u(h){const d=r.get(h);if(d){const f=h.index;f!==null&&d.version<f.version&&c(h)}else c(h);return r.get(h)}return{get:o,update:l,getWireframeAttribute:u}}function Kg(i,t,e){let n;function s(d){n=d}let r,a;function o(d){r=d.type,a=d.bytesPerElement}function l(d,f){i.drawElements(n,f,r,d*a),e.update(f,n,1)}function c(d,f,g){g!==0&&(i.drawElementsInstanced(n,f,r,d*a,g),e.update(f,n,g))}function u(d,f,g){if(g===0)return;t.get("WEBGL_multi_draw").multiDrawElementsWEBGL(n,f,0,r,d,0,g);let m=0;for(let p=0;p<g;p++)m+=f[p];e.update(m,n,1)}function h(d,f,g,v){if(g===0)return;const m=t.get("WEBGL_multi_draw");if(m===null)for(let p=0;p<d.length;p++)c(d[p]/a,f[p],v[p]);else{m.multiDrawElementsInstancedWEBGL(n,f,0,r,d,0,v,0,g);let p=0;for(let M=0;M<g;M++)p+=f[M]*v[M];e.update(p,n,1)}}this.setMode=s,this.setIndex=o,this.render=l,this.renderInstances=c,this.renderMultiDraw=u,this.renderMultiDrawInstances=h}function Zg(i){const t={geometries:0,textures:0},e={frame:0,calls:0,triangles:0,points:0,lines:0};function n(r,a,o){switch(e.calls++,a){case i.TRIANGLES:e.triangles+=o*(r/3);break;case i.LINES:e.lines+=o*(r/2);break;case i.LINE_STRIP:e.lines+=o*(r-1);break;case i.LINE_LOOP:e.lines+=o*r;break;case i.POINTS:e.points+=o*r;break;default:console.error("THREE.WebGLInfo: Unknown draw mode:",a);break}}function s(){e.calls=0,e.triangles=0,e.points=0,e.lines=0}return{memory:t,render:e,programs:null,autoReset:!0,reset:s,update:n}}function jg(i,t,e){const n=new WeakMap,s=new me;function r(a,o,l){const c=a.morphTargetInfluences,u=o.morphAttributes.position||o.morphAttributes.normal||o.morphAttributes.color,h=u!==void 0?u.length:0;let d=n.get(o);if(d===void 0||d.count!==h){let y=function(){A.dispose(),n.delete(o),o.removeEventListener("dispose",y)};var f=y;d!==void 0&&d.texture.dispose();const g=o.morphAttributes.position!==void 0,v=o.morphAttributes.normal!==void 0,m=o.morphAttributes.color!==void 0,p=o.morphAttributes.position||[],M=o.morphAttributes.normal||[],b=o.morphAttributes.color||[];let x=0;g===!0&&(x=1),v===!0&&(x=2),m===!0&&(x=3);let E=o.attributes.position.count*x,T=1;E>t.maxTextureSize&&(T=Math.ceil(E/t.maxTextureSize),E=t.maxTextureSize);const C=new Float32Array(E*T*4*h),A=new Uh(C,E,T,h);A.type=vn,A.needsUpdate=!0;const _=x*4;for(let L=0;L<h;L++){const U=p[L],z=M[L],$=b[L],X=E*T*4*L;for(let q=0;q<U.count;q++){const Z=q*_;g===!0&&(s.fromBufferAttribute(U,q),C[X+Z+0]=s.x,C[X+Z+1]=s.y,C[X+Z+2]=s.z,C[X+Z+3]=0),v===!0&&(s.fromBufferAttribute(z,q),C[X+Z+4]=s.x,C[X+Z+5]=s.y,C[X+Z+6]=s.z,C[X+Z+7]=0),m===!0&&(s.fromBufferAttribute($,q),C[X+Z+8]=s.x,C[X+Z+9]=s.y,C[X+Z+10]=s.z,C[X+Z+11]=$.itemSize===4?s.w:1)}}d={count:h,texture:A,size:new ft(E,T)},n.set(o,d),o.addEventListener("dispose",y)}if(a.isInstancedMesh===!0&&a.morphTexture!==null)l.getUniforms().setValue(i,"morphTexture",a.morphTexture,e);else{let g=0;for(let m=0;m<c.length;m++)g+=c[m];const v=o.morphTargetsRelative?1:1-g;l.getUniforms().setValue(i,"morphTargetBaseInfluence",v),l.getUniforms().setValue(i,"morphTargetInfluences",c)}l.getUniforms().setValue(i,"morphTargetsTexture",d.texture,e),l.getUniforms().setValue(i,"morphTargetsTextureSize",d.size)}return{update:r}}function Qg(i,t,e,n){let s=new WeakMap;function r(l){const c=n.render.frame,u=l.geometry,h=t.get(l,u);if(s.get(h)!==c&&(t.update(h),s.set(h,c)),l.isInstancedMesh&&(l.hasEventListener("dispose",o)===!1&&l.addEventListener("dispose",o),s.get(l)!==c&&(e.update(l.instanceMatrix,i.ARRAY_BUFFER),l.instanceColor!==null&&e.update(l.instanceColor,i.ARRAY_BUFFER),s.set(l,c))),l.isSkinnedMesh){const d=l.skeleton;s.get(d)!==c&&(d.update(),s.set(d,c))}return h}function a(){s=new WeakMap}function o(l){const c=l.target;c.removeEventListener("dispose",o),e.remove(c.instanceMatrix),c.instanceColor!==null&&e.remove(c.instanceColor)}return{update:r,dispose:a}}const su=new De,Bc=new $h(1,1),ru=new Uh,au=new Gf,ou=new Gh,Uc=[],Nc=[],Oc=new Float32Array(16),zc=new Float32Array(9),kc=new Float32Array(4);function os(i,t,e){const n=i[0];if(n<=0||n>0)return i;const s=t*e;let r=Uc[s];if(r===void 0&&(r=new Float32Array(s),Uc[s]=r),t!==0){n.toArray(r,0);for(let a=1,o=0;a!==t;++a)o+=e,i[a].toArray(r,o)}return r}function be(i,t){if(i.length!==t.length)return!1;for(let e=0,n=i.length;e<n;e++)if(i[e]!==t[e])return!1;return!0}function Re(i,t){for(let e=0,n=t.length;e<n;e++)i[e]=t[e]}function ea(i,t){let e=Nc[t];e===void 0&&(e=new Int32Array(t),Nc[t]=e);for(let n=0;n!==t;++n)e[n]=i.allocateTextureUnit();return e}function tv(i,t){const e=this.cache;e[0]!==t&&(i.uniform1f(this.addr,t),e[0]=t)}function ev(i,t){const e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y)&&(i.uniform2f(this.addr,t.x,t.y),e[0]=t.x,e[1]=t.y);else{if(be(e,t))return;i.uniform2fv(this.addr,t),Re(e,t)}}function nv(i,t){const e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z)&&(i.uniform3f(this.addr,t.x,t.y,t.z),e[0]=t.x,e[1]=t.y,e[2]=t.z);else if(t.r!==void 0)(e[0]!==t.r||e[1]!==t.g||e[2]!==t.b)&&(i.uniform3f(this.addr,t.r,t.g,t.b),e[0]=t.r,e[1]=t.g,e[2]=t.b);else{if(be(e,t))return;i.uniform3fv(this.addr,t),Re(e,t)}}function iv(i,t){const e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z||e[3]!==t.w)&&(i.uniform4f(this.addr,t.x,t.y,t.z,t.w),e[0]=t.x,e[1]=t.y,e[2]=t.z,e[3]=t.w);else{if(be(e,t))return;i.uniform4fv(this.addr,t),Re(e,t)}}function sv(i,t){const e=this.cache,n=t.elements;if(n===void 0){if(be(e,t))return;i.uniformMatrix2fv(this.addr,!1,t),Re(e,t)}else{if(be(e,n))return;kc.set(n),i.uniformMatrix2fv(this.addr,!1,kc),Re(e,n)}}function rv(i,t){const e=this.cache,n=t.elements;if(n===void 0){if(be(e,t))return;i.uniformMatrix3fv(this.addr,!1,t),Re(e,t)}else{if(be(e,n))return;zc.set(n),i.uniformMatrix3fv(this.addr,!1,zc),Re(e,n)}}function av(i,t){const e=this.cache,n=t.elements;if(n===void 0){if(be(e,t))return;i.uniformMatrix4fv(this.addr,!1,t),Re(e,t)}else{if(be(e,n))return;Oc.set(n),i.uniformMatrix4fv(this.addr,!1,Oc),Re(e,n)}}function ov(i,t){const e=this.cache;e[0]!==t&&(i.uniform1i(this.addr,t),e[0]=t)}function lv(i,t){const e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y)&&(i.uniform2i(this.addr,t.x,t.y),e[0]=t.x,e[1]=t.y);else{if(be(e,t))return;i.uniform2iv(this.addr,t),Re(e,t)}}function cv(i,t){const e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z)&&(i.uniform3i(this.addr,t.x,t.y,t.z),e[0]=t.x,e[1]=t.y,e[2]=t.z);else{if(be(e,t))return;i.uniform3iv(this.addr,t),Re(e,t)}}function hv(i,t){const e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z||e[3]!==t.w)&&(i.uniform4i(this.addr,t.x,t.y,t.z,t.w),e[0]=t.x,e[1]=t.y,e[2]=t.z,e[3]=t.w);else{if(be(e,t))return;i.uniform4iv(this.addr,t),Re(e,t)}}function uv(i,t){const e=this.cache;e[0]!==t&&(i.uniform1ui(this.addr,t),e[0]=t)}function dv(i,t){const e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y)&&(i.uniform2ui(this.addr,t.x,t.y),e[0]=t.x,e[1]=t.y);else{if(be(e,t))return;i.uniform2uiv(this.addr,t),Re(e,t)}}function fv(i,t){const e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z)&&(i.uniform3ui(this.addr,t.x,t.y,t.z),e[0]=t.x,e[1]=t.y,e[2]=t.z);else{if(be(e,t))return;i.uniform3uiv(this.addr,t),Re(e,t)}}function pv(i,t){const e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z||e[3]!==t.w)&&(i.uniform4ui(this.addr,t.x,t.y,t.z,t.w),e[0]=t.x,e[1]=t.y,e[2]=t.z,e[3]=t.w);else{if(be(e,t))return;i.uniform4uiv(this.addr,t),Re(e,t)}}function mv(i,t,e){const n=this.cache,s=e.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s);let r;this.type===i.SAMPLER_2D_SHADOW?(Bc.compareFunction=Dh,r=Bc):r=su,e.setTexture2D(t||r,s)}function gv(i,t,e){const n=this.cache,s=e.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s),e.setTexture3D(t||au,s)}function vv(i,t,e){const n=this.cache,s=e.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s),e.setTextureCube(t||ou,s)}function Sv(i,t,e){const n=this.cache,s=e.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s),e.setTexture2DArray(t||ru,s)}function xv(i){switch(i){case 5126:return tv;case 35664:return ev;case 35665:return nv;case 35666:return iv;case 35674:return sv;case 35675:return rv;case 35676:return av;case 5124:case 35670:return ov;case 35667:case 35671:return lv;case 35668:case 35672:return cv;case 35669:case 35673:return hv;case 5125:return uv;case 36294:return dv;case 36295:return fv;case 36296:return pv;case 35678:case 36198:case 36298:case 36306:case 35682:return mv;case 35679:case 36299:case 36307:return gv;case 35680:case 36300:case 36308:case 36293:return vv;case 36289:case 36303:case 36311:case 36292:return Sv}}function _v(i,t){i.uniform1fv(this.addr,t)}function yv(i,t){const e=os(t,this.size,2);i.uniform2fv(this.addr,e)}function Mv(i,t){const e=os(t,this.size,3);i.uniform3fv(this.addr,e)}function bv(i,t){const e=os(t,this.size,4);i.uniform4fv(this.addr,e)}function Rv(i,t){const e=os(t,this.size,4);i.uniformMatrix2fv(this.addr,!1,e)}function wv(i,t){const e=os(t,this.size,9);i.uniformMatrix3fv(this.addr,!1,e)}function Ev(i,t){const e=os(t,this.size,16);i.uniformMatrix4fv(this.addr,!1,e)}function Tv(i,t){i.uniform1iv(this.addr,t)}function Cv(i,t){i.uniform2iv(this.addr,t)}function Av(i,t){i.uniform3iv(this.addr,t)}function Lv(i,t){i.uniform4iv(this.addr,t)}function Pv(i,t){i.uniform1uiv(this.addr,t)}function Fv(i,t){i.uniform2uiv(this.addr,t)}function Iv(i,t){i.uniform3uiv(this.addr,t)}function Dv(i,t){i.uniform4uiv(this.addr,t)}function Bv(i,t,e){const n=this.cache,s=t.length,r=ea(e,s);be(n,r)||(i.uniform1iv(this.addr,r),Re(n,r));for(let a=0;a!==s;++a)e.setTexture2D(t[a]||su,r[a])}function Uv(i,t,e){const n=this.cache,s=t.length,r=ea(e,s);be(n,r)||(i.uniform1iv(this.addr,r),Re(n,r));for(let a=0;a!==s;++a)e.setTexture3D(t[a]||au,r[a])}function Nv(i,t,e){const n=this.cache,s=t.length,r=ea(e,s);be(n,r)||(i.uniform1iv(this.addr,r),Re(n,r));for(let a=0;a!==s;++a)e.setTextureCube(t[a]||ou,r[a])}function Ov(i,t,e){const n=this.cache,s=t.length,r=ea(e,s);be(n,r)||(i.uniform1iv(this.addr,r),Re(n,r));for(let a=0;a!==s;++a)e.setTexture2DArray(t[a]||ru,r[a])}function zv(i){switch(i){case 5126:return _v;case 35664:return yv;case 35665:return Mv;case 35666:return bv;case 35674:return Rv;case 35675:return wv;case 35676:return Ev;case 5124:case 35670:return Tv;case 35667:case 35671:return Cv;case 35668:case 35672:return Av;case 35669:case 35673:return Lv;case 5125:return Pv;case 36294:return Fv;case 36295:return Iv;case 36296:return Dv;case 35678:case 36198:case 36298:case 36306:case 35682:return Bv;case 35679:case 36299:case 36307:return Uv;case 35680:case 36300:case 36308:case 36293:return Nv;case 36289:case 36303:case 36311:case 36292:return Ov}}class kv{constructor(t,e,n){this.id=t,this.addr=n,this.cache=[],this.type=e.type,this.setValue=xv(e.type)}}class Hv{constructor(t,e,n){this.id=t,this.addr=n,this.cache=[],this.type=e.type,this.size=e.size,this.setValue=zv(e.type)}}class Gv{constructor(t){this.id=t,this.seq=[],this.map={}}setValue(t,e,n){const s=this.seq;for(let r=0,a=s.length;r!==a;++r){const o=s[r];o.setValue(t,e[o.id],n)}}}const Wa=/(\w+)(\])?(\[|\.)?/g;function Hc(i,t){i.seq.push(t),i.map[t.id]=t}function Vv(i,t,e){const n=i.name,s=n.length;for(Wa.lastIndex=0;;){const r=Wa.exec(n),a=Wa.lastIndex;let o=r[1];const l=r[2]==="]",c=r[3];if(l&&(o=o|0),c===void 0||c==="["&&a+2===s){Hc(e,c===void 0?new kv(o,i,t):new Hv(o,i,t));break}else{let h=e.map[o];h===void 0&&(h=new Gv(o),Hc(e,h)),e=h}}}class Or{constructor(t,e){this.seq=[],this.map={};const n=t.getProgramParameter(e,t.ACTIVE_UNIFORMS);for(let s=0;s<n;++s){const r=t.getActiveUniform(e,s),a=t.getUniformLocation(e,r.name);Vv(r,a,this)}}setValue(t,e,n,s){const r=this.map[e];r!==void 0&&r.setValue(t,n,s)}setOptional(t,e,n){const s=e[n];s!==void 0&&this.setValue(t,n,s)}static upload(t,e,n,s){for(let r=0,a=e.length;r!==a;++r){const o=e[r],l=n[o.id];l.needsUpdate!==!1&&o.setValue(t,l.value,s)}}static seqWithValue(t,e){const n=[];for(let s=0,r=t.length;s!==r;++s){const a=t[s];a.id in e&&n.push(a)}return n}}function Gc(i,t,e){const n=i.createShader(t);return i.shaderSource(n,e),i.compileShader(n),n}const Wv=37297;let $v=0;function Xv(i,t){const e=i.split(`
`),n=[],s=Math.max(t-6,0),r=Math.min(t+6,e.length);for(let a=s;a<r;a++){const o=a+1;n.push(`${o===t?">":" "} ${o}: ${e[a]}`)}return n.join(`
`)}const Vc=new zt;function qv(i){Kt._getMatrix(Vc,Kt.workingColorSpace,i);const t=`mat3( ${Vc.elements.map(e=>e.toFixed(4))} )`;switch(Kt.getTransfer(i)){case $r:return[t,"LinearTransferOETF"];case ae:return[t,"sRGBTransferOETF"];default:return console.warn("THREE.WebGLProgram: Unsupported color space: ",i),[t,"LinearTransferOETF"]}}function Wc(i,t,e){const n=i.getShaderParameter(t,i.COMPILE_STATUS),r=(i.getShaderInfoLog(t)||"").trim();if(n&&r==="")return"";const a=/ERROR: 0:(\d+)/.exec(r);if(a){const o=parseInt(a[1]);return e.toUpperCase()+`

`+r+`

`+Xv(i.getShaderSource(t),o)}else return r}function Yv(i,t){const e=qv(t);return[`vec4 ${i}( vec4 value ) {`,`	return ${e[1]}( vec4( value.rgb * ${e[0]}, value.a ) );`,"}"].join(`
`)}function Jv(i,t){let e;switch(t){case vf:e="Linear";break;case Sf:e="Reinhard";break;case xf:e="Cineon";break;case Rh:e="ACESFilmic";break;case yf:e="AgX";break;case Mf:e="Neutral";break;case _f:e="Custom";break;default:console.warn("THREE.WebGLProgram: Unsupported toneMapping:",t),e="Linear"}return"vec3 "+i+"( vec3 color ) { return "+e+"ToneMapping( color ); }"}const Rr=new B;function Kv(){Kt.getLuminanceCoefficients(Rr);const i=Rr.x.toFixed(4),t=Rr.y.toFixed(4),e=Rr.z.toFixed(4);return["float luminance( const in vec3 rgb ) {",`	const vec3 weights = vec3( ${i}, ${t}, ${e} );`,"	return dot( weights, rgb );","}"].join(`
`)}function Zv(i){return[i.extensionClipCullDistance?"#extension GL_ANGLE_clip_cull_distance : require":"",i.extensionMultiDraw?"#extension GL_ANGLE_multi_draw : require":""].filter(Rs).join(`
`)}function jv(i){const t=[];for(const e in i){const n=i[e];n!==!1&&t.push("#define "+e+" "+n)}return t.join(`
`)}function Qv(i,t){const e={},n=i.getProgramParameter(t,i.ACTIVE_ATTRIBUTES);for(let s=0;s<n;s++){const r=i.getActiveAttrib(t,s),a=r.name;let o=1;r.type===i.FLOAT_MAT2&&(o=2),r.type===i.FLOAT_MAT3&&(o=3),r.type===i.FLOAT_MAT4&&(o=4),e[a]={type:r.type,location:i.getAttribLocation(t,a),locationSize:o}}return e}function Rs(i){return i!==""}function $c(i,t){const e=t.numSpotLightShadows+t.numSpotLightMaps-t.numSpotLightShadowsWithMaps;return i.replace(/NUM_DIR_LIGHTS/g,t.numDirLights).replace(/NUM_SPOT_LIGHTS/g,t.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g,t.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g,e).replace(/NUM_RECT_AREA_LIGHTS/g,t.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g,t.numPointLights).replace(/NUM_HEMI_LIGHTS/g,t.numHemiLights).replace(/NUM_DIR_LIGHT_SHADOWS/g,t.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g,t.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g,t.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g,t.numPointLightShadows)}function Xc(i,t){return i.replace(/NUM_CLIPPING_PLANES/g,t.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g,t.numClippingPlanes-t.numClipIntersection)}const tS=/^[ \t]*#include +<([\w\d./]+)>/gm;function Ko(i){return i.replace(tS,nS)}const eS=new Map;function nS(i,t){let e=Ht[t];if(e===void 0){const n=eS.get(t);if(n!==void 0)e=Ht[n],console.warn('THREE.WebGLRenderer: Shader chunk "%s" has been deprecated. Use "%s" instead.',t,n);else throw new Error("Can not resolve #include <"+t+">")}return Ko(e)}const iS=/#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;function qc(i){return i.replace(iS,sS)}function sS(i,t,e,n){let s="";for(let r=parseInt(t);r<parseInt(e);r++)s+=n.replace(/\[\s*i\s*\]/g,"[ "+r+" ]").replace(/UNROLLED_LOOP_INDEX/g,r);return s}function Yc(i){let t=`precision ${i.precision} float;
	precision ${i.precision} int;
	precision ${i.precision} sampler2D;
	precision ${i.precision} samplerCube;
	precision ${i.precision} sampler3D;
	precision ${i.precision} sampler2DArray;
	precision ${i.precision} sampler2DShadow;
	precision ${i.precision} samplerCubeShadow;
	precision ${i.precision} sampler2DArrayShadow;
	precision ${i.precision} isampler2D;
	precision ${i.precision} isampler3D;
	precision ${i.precision} isamplerCube;
	precision ${i.precision} isampler2DArray;
	precision ${i.precision} usampler2D;
	precision ${i.precision} usampler3D;
	precision ${i.precision} usamplerCube;
	precision ${i.precision} usampler2DArray;
	`;return i.precision==="highp"?t+=`
#define HIGH_PRECISION`:i.precision==="mediump"?t+=`
#define MEDIUM_PRECISION`:i.precision==="lowp"&&(t+=`
#define LOW_PRECISION`),t}function rS(i){let t="SHADOWMAP_TYPE_BASIC";return i.shadowMapType===yh?t="SHADOWMAP_TYPE_PCF":i.shadowMapType===Mh?t="SHADOWMAP_TYPE_PCF_SOFT":i.shadowMapType===Pn&&(t="SHADOWMAP_TYPE_VSM"),t}function aS(i){let t="ENVMAP_TYPE_CUBE";if(i.envMap)switch(i.envMapMode){case ji:case Qi:t="ENVMAP_TYPE_CUBE";break;case jr:t="ENVMAP_TYPE_CUBE_UV";break}return t}function oS(i){let t="ENVMAP_MODE_REFLECTION";if(i.envMap)switch(i.envMapMode){case Qi:t="ENVMAP_MODE_REFRACTION";break}return t}function lS(i){let t="ENVMAP_BLENDING_NONE";if(i.envMap)switch(i.combine){case bh:t="ENVMAP_BLENDING_MULTIPLY";break;case mf:t="ENVMAP_BLENDING_MIX";break;case gf:t="ENVMAP_BLENDING_ADD";break}return t}function cS(i){const t=i.envMapCubeUVHeight;if(t===null)return null;const e=Math.log2(t)-2,n=1/t;return{texelWidth:1/(3*Math.max(Math.pow(2,e),112)),texelHeight:n,maxMip:e}}function hS(i,t,e,n){const s=i.getContext(),r=e.defines;let a=e.vertexShader,o=e.fragmentShader;const l=rS(e),c=aS(e),u=oS(e),h=lS(e),d=cS(e),f=Zv(e),g=jv(r),v=s.createProgram();let m,p,M=e.glslVersion?"#version "+e.glslVersion+`
`:"";e.isRawShaderMaterial?(m=["#define SHADER_TYPE "+e.shaderType,"#define SHADER_NAME "+e.shaderName,g].filter(Rs).join(`
`),m.length>0&&(m+=`
`),p=["#define SHADER_TYPE "+e.shaderType,"#define SHADER_NAME "+e.shaderName,g].filter(Rs).join(`
`),p.length>0&&(p+=`
`)):(m=[Yc(e),"#define SHADER_TYPE "+e.shaderType,"#define SHADER_NAME "+e.shaderName,g,e.extensionClipCullDistance?"#define USE_CLIP_DISTANCE":"",e.batching?"#define USE_BATCHING":"",e.batchingColor?"#define USE_BATCHING_COLOR":"",e.instancing?"#define USE_INSTANCING":"",e.instancingColor?"#define USE_INSTANCING_COLOR":"",e.instancingMorph?"#define USE_INSTANCING_MORPH":"",e.useFog&&e.fog?"#define USE_FOG":"",e.useFog&&e.fogExp2?"#define FOG_EXP2":"",e.map?"#define USE_MAP":"",e.envMap?"#define USE_ENVMAP":"",e.envMap?"#define "+u:"",e.lightMap?"#define USE_LIGHTMAP":"",e.aoMap?"#define USE_AOMAP":"",e.bumpMap?"#define USE_BUMPMAP":"",e.normalMap?"#define USE_NORMALMAP":"",e.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",e.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",e.displacementMap?"#define USE_DISPLACEMENTMAP":"",e.emissiveMap?"#define USE_EMISSIVEMAP":"",e.anisotropy?"#define USE_ANISOTROPY":"",e.anisotropyMap?"#define USE_ANISOTROPYMAP":"",e.clearcoatMap?"#define USE_CLEARCOATMAP":"",e.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",e.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",e.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",e.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",e.specularMap?"#define USE_SPECULARMAP":"",e.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",e.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",e.roughnessMap?"#define USE_ROUGHNESSMAP":"",e.metalnessMap?"#define USE_METALNESSMAP":"",e.alphaMap?"#define USE_ALPHAMAP":"",e.alphaHash?"#define USE_ALPHAHASH":"",e.transmission?"#define USE_TRANSMISSION":"",e.transmissionMap?"#define USE_TRANSMISSIONMAP":"",e.thicknessMap?"#define USE_THICKNESSMAP":"",e.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",e.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",e.mapUv?"#define MAP_UV "+e.mapUv:"",e.alphaMapUv?"#define ALPHAMAP_UV "+e.alphaMapUv:"",e.lightMapUv?"#define LIGHTMAP_UV "+e.lightMapUv:"",e.aoMapUv?"#define AOMAP_UV "+e.aoMapUv:"",e.emissiveMapUv?"#define EMISSIVEMAP_UV "+e.emissiveMapUv:"",e.bumpMapUv?"#define BUMPMAP_UV "+e.bumpMapUv:"",e.normalMapUv?"#define NORMALMAP_UV "+e.normalMapUv:"",e.displacementMapUv?"#define DISPLACEMENTMAP_UV "+e.displacementMapUv:"",e.metalnessMapUv?"#define METALNESSMAP_UV "+e.metalnessMapUv:"",e.roughnessMapUv?"#define ROUGHNESSMAP_UV "+e.roughnessMapUv:"",e.anisotropyMapUv?"#define ANISOTROPYMAP_UV "+e.anisotropyMapUv:"",e.clearcoatMapUv?"#define CLEARCOATMAP_UV "+e.clearcoatMapUv:"",e.clearcoatNormalMapUv?"#define CLEARCOAT_NORMALMAP_UV "+e.clearcoatNormalMapUv:"",e.clearcoatRoughnessMapUv?"#define CLEARCOAT_ROUGHNESSMAP_UV "+e.clearcoatRoughnessMapUv:"",e.iridescenceMapUv?"#define IRIDESCENCEMAP_UV "+e.iridescenceMapUv:"",e.iridescenceThicknessMapUv?"#define IRIDESCENCE_THICKNESSMAP_UV "+e.iridescenceThicknessMapUv:"",e.sheenColorMapUv?"#define SHEEN_COLORMAP_UV "+e.sheenColorMapUv:"",e.sheenRoughnessMapUv?"#define SHEEN_ROUGHNESSMAP_UV "+e.sheenRoughnessMapUv:"",e.specularMapUv?"#define SPECULARMAP_UV "+e.specularMapUv:"",e.specularColorMapUv?"#define SPECULAR_COLORMAP_UV "+e.specularColorMapUv:"",e.specularIntensityMapUv?"#define SPECULAR_INTENSITYMAP_UV "+e.specularIntensityMapUv:"",e.transmissionMapUv?"#define TRANSMISSIONMAP_UV "+e.transmissionMapUv:"",e.thicknessMapUv?"#define THICKNESSMAP_UV "+e.thicknessMapUv:"",e.vertexTangents&&e.flatShading===!1?"#define USE_TANGENT":"",e.vertexColors?"#define USE_COLOR":"",e.vertexAlphas?"#define USE_COLOR_ALPHA":"",e.vertexUv1s?"#define USE_UV1":"",e.vertexUv2s?"#define USE_UV2":"",e.vertexUv3s?"#define USE_UV3":"",e.pointsUvs?"#define USE_POINTS_UV":"",e.flatShading?"#define FLAT_SHADED":"",e.skinning?"#define USE_SKINNING":"",e.morphTargets?"#define USE_MORPHTARGETS":"",e.morphNormals&&e.flatShading===!1?"#define USE_MORPHNORMALS":"",e.morphColors?"#define USE_MORPHCOLORS":"",e.morphTargetsCount>0?"#define MORPHTARGETS_TEXTURE_STRIDE "+e.morphTextureStride:"",e.morphTargetsCount>0?"#define MORPHTARGETS_COUNT "+e.morphTargetsCount:"",e.doubleSided?"#define DOUBLE_SIDED":"",e.flipSided?"#define FLIP_SIDED":"",e.shadowMapEnabled?"#define USE_SHADOWMAP":"",e.shadowMapEnabled?"#define "+l:"",e.sizeAttenuation?"#define USE_SIZEATTENUATION":"",e.numLightProbes>0?"#define USE_LIGHT_PROBES":"",e.logarithmicDepthBuffer?"#define USE_LOGARITHMIC_DEPTH_BUFFER":"",e.reversedDepthBuffer?"#define USE_REVERSED_DEPTH_BUFFER":"","uniform mat4 modelMatrix;","uniform mat4 modelViewMatrix;","uniform mat4 projectionMatrix;","uniform mat4 viewMatrix;","uniform mat3 normalMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;","#ifdef USE_INSTANCING","	attribute mat4 instanceMatrix;","#endif","#ifdef USE_INSTANCING_COLOR","	attribute vec3 instanceColor;","#endif","#ifdef USE_INSTANCING_MORPH","	uniform sampler2D morphTexture;","#endif","attribute vec3 position;","attribute vec3 normal;","attribute vec2 uv;","#ifdef USE_UV1","	attribute vec2 uv1;","#endif","#ifdef USE_UV2","	attribute vec2 uv2;","#endif","#ifdef USE_UV3","	attribute vec2 uv3;","#endif","#ifdef USE_TANGENT","	attribute vec4 tangent;","#endif","#if defined( USE_COLOR_ALPHA )","	attribute vec4 color;","#elif defined( USE_COLOR )","	attribute vec3 color;","#endif","#ifdef USE_SKINNING","	attribute vec4 skinIndex;","	attribute vec4 skinWeight;","#endif",`
`].filter(Rs).join(`
`),p=[Yc(e),"#define SHADER_TYPE "+e.shaderType,"#define SHADER_NAME "+e.shaderName,g,e.useFog&&e.fog?"#define USE_FOG":"",e.useFog&&e.fogExp2?"#define FOG_EXP2":"",e.alphaToCoverage?"#define ALPHA_TO_COVERAGE":"",e.map?"#define USE_MAP":"",e.matcap?"#define USE_MATCAP":"",e.envMap?"#define USE_ENVMAP":"",e.envMap?"#define "+c:"",e.envMap?"#define "+u:"",e.envMap?"#define "+h:"",d?"#define CUBEUV_TEXEL_WIDTH "+d.texelWidth:"",d?"#define CUBEUV_TEXEL_HEIGHT "+d.texelHeight:"",d?"#define CUBEUV_MAX_MIP "+d.maxMip+".0":"",e.lightMap?"#define USE_LIGHTMAP":"",e.aoMap?"#define USE_AOMAP":"",e.bumpMap?"#define USE_BUMPMAP":"",e.normalMap?"#define USE_NORMALMAP":"",e.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",e.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",e.emissiveMap?"#define USE_EMISSIVEMAP":"",e.anisotropy?"#define USE_ANISOTROPY":"",e.anisotropyMap?"#define USE_ANISOTROPYMAP":"",e.clearcoat?"#define USE_CLEARCOAT":"",e.clearcoatMap?"#define USE_CLEARCOATMAP":"",e.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",e.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",e.dispersion?"#define USE_DISPERSION":"",e.iridescence?"#define USE_IRIDESCENCE":"",e.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",e.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",e.specularMap?"#define USE_SPECULARMAP":"",e.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",e.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",e.roughnessMap?"#define USE_ROUGHNESSMAP":"",e.metalnessMap?"#define USE_METALNESSMAP":"",e.alphaMap?"#define USE_ALPHAMAP":"",e.alphaTest?"#define USE_ALPHATEST":"",e.alphaHash?"#define USE_ALPHAHASH":"",e.sheen?"#define USE_SHEEN":"",e.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",e.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",e.transmission?"#define USE_TRANSMISSION":"",e.transmissionMap?"#define USE_TRANSMISSIONMAP":"",e.thicknessMap?"#define USE_THICKNESSMAP":"",e.vertexTangents&&e.flatShading===!1?"#define USE_TANGENT":"",e.vertexColors||e.instancingColor||e.batchingColor?"#define USE_COLOR":"",e.vertexAlphas?"#define USE_COLOR_ALPHA":"",e.vertexUv1s?"#define USE_UV1":"",e.vertexUv2s?"#define USE_UV2":"",e.vertexUv3s?"#define USE_UV3":"",e.pointsUvs?"#define USE_POINTS_UV":"",e.gradientMap?"#define USE_GRADIENTMAP":"",e.flatShading?"#define FLAT_SHADED":"",e.doubleSided?"#define DOUBLE_SIDED":"",e.flipSided?"#define FLIP_SIDED":"",e.shadowMapEnabled?"#define USE_SHADOWMAP":"",e.shadowMapEnabled?"#define "+l:"",e.premultipliedAlpha?"#define PREMULTIPLIED_ALPHA":"",e.numLightProbes>0?"#define USE_LIGHT_PROBES":"",e.decodeVideoTexture?"#define DECODE_VIDEO_TEXTURE":"",e.decodeVideoTextureEmissive?"#define DECODE_VIDEO_TEXTURE_EMISSIVE":"",e.logarithmicDepthBuffer?"#define USE_LOGARITHMIC_DEPTH_BUFFER":"",e.reversedDepthBuffer?"#define USE_REVERSED_DEPTH_BUFFER":"","uniform mat4 viewMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;",e.toneMapping!==Xn?"#define TONE_MAPPING":"",e.toneMapping!==Xn?Ht.tonemapping_pars_fragment:"",e.toneMapping!==Xn?Jv("toneMapping",e.toneMapping):"",e.dithering?"#define DITHERING":"",e.opaque?"#define OPAQUE":"",Ht.colorspace_pars_fragment,Yv("linearToOutputTexel",e.outputColorSpace),Kv(),e.useDepthPacking?"#define DEPTH_PACKING "+e.depthPacking:"",`
`].filter(Rs).join(`
`)),a=Ko(a),a=$c(a,e),a=Xc(a,e),o=Ko(o),o=$c(o,e),o=Xc(o,e),a=qc(a),o=qc(o),e.isRawShaderMaterial!==!0&&(M=`#version 300 es
`,m=[f,"#define attribute in","#define varying out","#define texture2D texture"].join(`
`)+`
`+m,p=["#define varying in",e.glslVersion===kl?"":"layout(location = 0) out highp vec4 pc_fragColor;",e.glslVersion===kl?"":"#define gl_FragColor pc_fragColor","#define gl_FragDepthEXT gl_FragDepth","#define texture2D texture","#define textureCube texture","#define texture2DProj textureProj","#define texture2DLodEXT textureLod","#define texture2DProjLodEXT textureProjLod","#define textureCubeLodEXT textureLod","#define texture2DGradEXT textureGrad","#define texture2DProjGradEXT textureProjGrad","#define textureCubeGradEXT textureGrad"].join(`
`)+`
`+p);const b=M+m+a,x=M+p+o,E=Gc(s,s.VERTEX_SHADER,b),T=Gc(s,s.FRAGMENT_SHADER,x);s.attachShader(v,E),s.attachShader(v,T),e.index0AttributeName!==void 0?s.bindAttribLocation(v,0,e.index0AttributeName):e.morphTargets===!0&&s.bindAttribLocation(v,0,"position"),s.linkProgram(v);function C(L){if(i.debug.checkShaderErrors){const U=s.getProgramInfoLog(v)||"",z=s.getShaderInfoLog(E)||"",$=s.getShaderInfoLog(T)||"",X=U.trim(),q=z.trim(),Z=$.trim();let W=!0,rt=!0;if(s.getProgramParameter(v,s.LINK_STATUS)===!1)if(W=!1,typeof i.debug.onShaderError=="function")i.debug.onShaderError(s,v,E,T);else{const ut=Wc(s,E,"vertex"),Et=Wc(s,T,"fragment");console.error("THREE.WebGLProgram: Shader Error "+s.getError()+" - VALIDATE_STATUS "+s.getProgramParameter(v,s.VALIDATE_STATUS)+`

Material Name: `+L.name+`
Material Type: `+L.type+`

Program Info Log: `+X+`
`+ut+`
`+Et)}else X!==""?console.warn("THREE.WebGLProgram: Program Info Log:",X):(q===""||Z==="")&&(rt=!1);rt&&(L.diagnostics={runnable:W,programLog:X,vertexShader:{log:q,prefix:m},fragmentShader:{log:Z,prefix:p}})}s.deleteShader(E),s.deleteShader(T),A=new Or(s,v),_=Qv(s,v)}let A;this.getUniforms=function(){return A===void 0&&C(this),A};let _;this.getAttributes=function(){return _===void 0&&C(this),_};let y=e.rendererExtensionParallelShaderCompile===!1;return this.isReady=function(){return y===!1&&(y=s.getProgramParameter(v,Wv)),y},this.destroy=function(){n.releaseStatesOfProgram(this),s.deleteProgram(v),this.program=void 0},this.type=e.shaderType,this.name=e.shaderName,this.id=$v++,this.cacheKey=t,this.usedTimes=1,this.program=v,this.vertexShader=E,this.fragmentShader=T,this}let uS=0;class dS{constructor(){this.shaderCache=new Map,this.materialCache=new Map}update(t){const e=t.vertexShader,n=t.fragmentShader,s=this._getShaderStage(e),r=this._getShaderStage(n),a=this._getShaderCacheForMaterial(t);return a.has(s)===!1&&(a.add(s),s.usedTimes++),a.has(r)===!1&&(a.add(r),r.usedTimes++),this}remove(t){const e=this.materialCache.get(t);for(const n of e)n.usedTimes--,n.usedTimes===0&&this.shaderCache.delete(n.code);return this.materialCache.delete(t),this}getVertexShaderID(t){return this._getShaderStage(t.vertexShader).id}getFragmentShaderID(t){return this._getShaderStage(t.fragmentShader).id}dispose(){this.shaderCache.clear(),this.materialCache.clear()}_getShaderCacheForMaterial(t){const e=this.materialCache;let n=e.get(t);return n===void 0&&(n=new Set,e.set(t,n)),n}_getShaderStage(t){const e=this.shaderCache;let n=e.get(t);return n===void 0&&(n=new fS(t),e.set(t,n)),n}}class fS{constructor(t){this.id=uS++,this.code=t,this.usedTimes=0}}function pS(i,t,e,n,s,r,a){const o=new ll,l=new dS,c=new Set,u=[],h=s.logarithmicDepthBuffer,d=s.vertexTextures;let f=s.precision;const g={MeshDepthMaterial:"depth",MeshDistanceMaterial:"distanceRGBA",MeshNormalMaterial:"normal",MeshBasicMaterial:"basic",MeshLambertMaterial:"lambert",MeshPhongMaterial:"phong",MeshToonMaterial:"toon",MeshStandardMaterial:"physical",MeshPhysicalMaterial:"physical",MeshMatcapMaterial:"matcap",LineBasicMaterial:"basic",LineDashedMaterial:"dashed",PointsMaterial:"points",ShadowMaterial:"shadow",SpriteMaterial:"sprite"};function v(_){return c.add(_),_===0?"uv":`uv${_}`}function m(_,y,L,U,z){const $=U.fog,X=z.geometry,q=_.isMeshStandardMaterial?U.environment:null,Z=(_.isMeshStandardMaterial?e:t).get(_.envMap||q),W=Z&&Z.mapping===jr?Z.image.height:null,rt=g[_.type];_.precision!==null&&(f=s.getMaxPrecision(_.precision),f!==_.precision&&console.warn("THREE.WebGLProgram.getParameters:",_.precision,"not supported, using",f,"instead."));const ut=X.morphAttributes.position||X.morphAttributes.normal||X.morphAttributes.color,Et=ut!==void 0?ut.length:0;let kt=0;X.morphAttributes.position!==void 0&&(kt=1),X.morphAttributes.normal!==void 0&&(kt=2),X.morphAttributes.color!==void 0&&(kt=3);let Zt,ee,Yt,K;if(rt){const Qt=pn[rt];Zt=Qt.vertexShader,ee=Qt.fragmentShader}else Zt=_.vertexShader,ee=_.fragmentShader,l.update(_),Yt=l.getVertexShaderID(_),K=l.getFragmentShaderID(_);const j=i.getRenderTarget(),mt=i.state.buffers.depth.getReversed(),Pt=z.isInstancedMesh===!0,gt=z.isBatchedMesh===!0,Vt=!!_.map,we=!!_.matcap,P=!!Z,ne=!!_.aoMap,Bt=!!_.lightMap,Tt=!!_.bumpMap,vt=!!_.normalMap,ie=!!_.displacementMap,St=!!_.emissiveMap,Ot=!!_.metalnessMap,xe=!!_.roughnessMap,at=_.anisotropy>0,w=_.clearcoat>0,S=_.dispersion>0,F=_.iridescence>0,k=_.sheen>0,Y=_.transmission>0,V=at&&!!_.anisotropyMap,wt=w&&!!_.clearcoatMap,st=w&&!!_.clearcoatNormalMap,_t=w&&!!_.clearcoatRoughnessMap,bt=F&&!!_.iridescenceMap,tt=F&&!!_.iridescenceThicknessMap,ot=k&&!!_.sheenColorMap,Lt=k&&!!_.sheenRoughnessMap,Rt=!!_.specularMap,lt=!!_.specularColorMap,Ut=!!_.specularIntensityMap,D=Y&&!!_.transmissionMap,et=Y&&!!_.thicknessMap,it=!!_.gradientMap,dt=!!_.alphaMap,Q=_.alphaTest>0,J=!!_.alphaHash,xt=!!_.extensions;let It=Xn;_.toneMapped&&(j===null||j.isXRRenderTarget===!0)&&(It=i.toneMapping);const jt={shaderID:rt,shaderType:_.type,shaderName:_.name,vertexShader:Zt,fragmentShader:ee,defines:_.defines,customVertexShaderID:Yt,customFragmentShaderID:K,isRawShaderMaterial:_.isRawShaderMaterial===!0,glslVersion:_.glslVersion,precision:f,batching:gt,batchingColor:gt&&z._colorsTexture!==null,instancing:Pt,instancingColor:Pt&&z.instanceColor!==null,instancingMorph:Pt&&z.morphTexture!==null,supportsVertexTextures:d,outputColorSpace:j===null?i.outputColorSpace:j.isXRRenderTarget===!0?j.texture.colorSpace:es,alphaToCoverage:!!_.alphaToCoverage,map:Vt,matcap:we,envMap:P,envMapMode:P&&Z.mapping,envMapCubeUVHeight:W,aoMap:ne,lightMap:Bt,bumpMap:Tt,normalMap:vt,displacementMap:d&&ie,emissiveMap:St,normalMapObjectSpace:vt&&_.normalMapType===Ef,normalMapTangentSpace:vt&&_.normalMapType===Ih,metalnessMap:Ot,roughnessMap:xe,anisotropy:at,anisotropyMap:V,clearcoat:w,clearcoatMap:wt,clearcoatNormalMap:st,clearcoatRoughnessMap:_t,dispersion:S,iridescence:F,iridescenceMap:bt,iridescenceThicknessMap:tt,sheen:k,sheenColorMap:ot,sheenRoughnessMap:Lt,specularMap:Rt,specularColorMap:lt,specularIntensityMap:Ut,transmission:Y,transmissionMap:D,thicknessMap:et,gradientMap:it,opaque:_.transparent===!1&&_.blending===$i&&_.alphaToCoverage===!1,alphaMap:dt,alphaTest:Q,alphaHash:J,combine:_.combine,mapUv:Vt&&v(_.map.channel),aoMapUv:ne&&v(_.aoMap.channel),lightMapUv:Bt&&v(_.lightMap.channel),bumpMapUv:Tt&&v(_.bumpMap.channel),normalMapUv:vt&&v(_.normalMap.channel),displacementMapUv:ie&&v(_.displacementMap.channel),emissiveMapUv:St&&v(_.emissiveMap.channel),metalnessMapUv:Ot&&v(_.metalnessMap.channel),roughnessMapUv:xe&&v(_.roughnessMap.channel),anisotropyMapUv:V&&v(_.anisotropyMap.channel),clearcoatMapUv:wt&&v(_.clearcoatMap.channel),clearcoatNormalMapUv:st&&v(_.clearcoatNormalMap.channel),clearcoatRoughnessMapUv:_t&&v(_.clearcoatRoughnessMap.channel),iridescenceMapUv:bt&&v(_.iridescenceMap.channel),iridescenceThicknessMapUv:tt&&v(_.iridescenceThicknessMap.channel),sheenColorMapUv:ot&&v(_.sheenColorMap.channel),sheenRoughnessMapUv:Lt&&v(_.sheenRoughnessMap.channel),specularMapUv:Rt&&v(_.specularMap.channel),specularColorMapUv:lt&&v(_.specularColorMap.channel),specularIntensityMapUv:Ut&&v(_.specularIntensityMap.channel),transmissionMapUv:D&&v(_.transmissionMap.channel),thicknessMapUv:et&&v(_.thicknessMap.channel),alphaMapUv:dt&&v(_.alphaMap.channel),vertexTangents:!!X.attributes.tangent&&(vt||at),vertexColors:_.vertexColors,vertexAlphas:_.vertexColors===!0&&!!X.attributes.color&&X.attributes.color.itemSize===4,pointsUvs:z.isPoints===!0&&!!X.attributes.uv&&(Vt||dt),fog:!!$,useFog:_.fog===!0,fogExp2:!!$&&$.isFogExp2,flatShading:_.flatShading===!0&&_.wireframe===!1,sizeAttenuation:_.sizeAttenuation===!0,logarithmicDepthBuffer:h,reversedDepthBuffer:mt,skinning:z.isSkinnedMesh===!0,morphTargets:X.morphAttributes.position!==void 0,morphNormals:X.morphAttributes.normal!==void 0,morphColors:X.morphAttributes.color!==void 0,morphTargetsCount:Et,morphTextureStride:kt,numDirLights:y.directional.length,numPointLights:y.point.length,numSpotLights:y.spot.length,numSpotLightMaps:y.spotLightMap.length,numRectAreaLights:y.rectArea.length,numHemiLights:y.hemi.length,numDirLightShadows:y.directionalShadowMap.length,numPointLightShadows:y.pointShadowMap.length,numSpotLightShadows:y.spotShadowMap.length,numSpotLightShadowsWithMaps:y.numSpotLightShadowsWithMaps,numLightProbes:y.numLightProbes,numClippingPlanes:a.numPlanes,numClipIntersection:a.numIntersection,dithering:_.dithering,shadowMapEnabled:i.shadowMap.enabled&&L.length>0,shadowMapType:i.shadowMap.type,toneMapping:It,decodeVideoTexture:Vt&&_.map.isVideoTexture===!0&&Kt.getTransfer(_.map.colorSpace)===ae,decodeVideoTextureEmissive:St&&_.emissiveMap.isVideoTexture===!0&&Kt.getTransfer(_.emissiveMap.colorSpace)===ae,premultipliedAlpha:_.premultipliedAlpha,doubleSided:_.side===Pe,flipSided:_.side===Ie,useDepthPacking:_.depthPacking>=0,depthPacking:_.depthPacking||0,index0AttributeName:_.index0AttributeName,extensionClipCullDistance:xt&&_.extensions.clipCullDistance===!0&&n.has("WEBGL_clip_cull_distance"),extensionMultiDraw:(xt&&_.extensions.multiDraw===!0||gt)&&n.has("WEBGL_multi_draw"),rendererExtensionParallelShaderCompile:n.has("KHR_parallel_shader_compile"),customProgramCacheKey:_.customProgramCacheKey()};return jt.vertexUv1s=c.has(1),jt.vertexUv2s=c.has(2),jt.vertexUv3s=c.has(3),c.clear(),jt}function p(_){const y=[];if(_.shaderID?y.push(_.shaderID):(y.push(_.customVertexShaderID),y.push(_.customFragmentShaderID)),_.defines!==void 0)for(const L in _.defines)y.push(L),y.push(_.defines[L]);return _.isRawShaderMaterial===!1&&(M(y,_),b(y,_),y.push(i.outputColorSpace)),y.push(_.customProgramCacheKey),y.join()}function M(_,y){_.push(y.precision),_.push(y.outputColorSpace),_.push(y.envMapMode),_.push(y.envMapCubeUVHeight),_.push(y.mapUv),_.push(y.alphaMapUv),_.push(y.lightMapUv),_.push(y.aoMapUv),_.push(y.bumpMapUv),_.push(y.normalMapUv),_.push(y.displacementMapUv),_.push(y.emissiveMapUv),_.push(y.metalnessMapUv),_.push(y.roughnessMapUv),_.push(y.anisotropyMapUv),_.push(y.clearcoatMapUv),_.push(y.clearcoatNormalMapUv),_.push(y.clearcoatRoughnessMapUv),_.push(y.iridescenceMapUv),_.push(y.iridescenceThicknessMapUv),_.push(y.sheenColorMapUv),_.push(y.sheenRoughnessMapUv),_.push(y.specularMapUv),_.push(y.specularColorMapUv),_.push(y.specularIntensityMapUv),_.push(y.transmissionMapUv),_.push(y.thicknessMapUv),_.push(y.combine),_.push(y.fogExp2),_.push(y.sizeAttenuation),_.push(y.morphTargetsCount),_.push(y.morphAttributeCount),_.push(y.numDirLights),_.push(y.numPointLights),_.push(y.numSpotLights),_.push(y.numSpotLightMaps),_.push(y.numHemiLights),_.push(y.numRectAreaLights),_.push(y.numDirLightShadows),_.push(y.numPointLightShadows),_.push(y.numSpotLightShadows),_.push(y.numSpotLightShadowsWithMaps),_.push(y.numLightProbes),_.push(y.shadowMapType),_.push(y.toneMapping),_.push(y.numClippingPlanes),_.push(y.numClipIntersection),_.push(y.depthPacking)}function b(_,y){o.disableAll(),y.supportsVertexTextures&&o.enable(0),y.instancing&&o.enable(1),y.instancingColor&&o.enable(2),y.instancingMorph&&o.enable(3),y.matcap&&o.enable(4),y.envMap&&o.enable(5),y.normalMapObjectSpace&&o.enable(6),y.normalMapTangentSpace&&o.enable(7),y.clearcoat&&o.enable(8),y.iridescence&&o.enable(9),y.alphaTest&&o.enable(10),y.vertexColors&&o.enable(11),y.vertexAlphas&&o.enable(12),y.vertexUv1s&&o.enable(13),y.vertexUv2s&&o.enable(14),y.vertexUv3s&&o.enable(15),y.vertexTangents&&o.enable(16),y.anisotropy&&o.enable(17),y.alphaHash&&o.enable(18),y.batching&&o.enable(19),y.dispersion&&o.enable(20),y.batchingColor&&o.enable(21),y.gradientMap&&o.enable(22),_.push(o.mask),o.disableAll(),y.fog&&o.enable(0),y.useFog&&o.enable(1),y.flatShading&&o.enable(2),y.logarithmicDepthBuffer&&o.enable(3),y.reversedDepthBuffer&&o.enable(4),y.skinning&&o.enable(5),y.morphTargets&&o.enable(6),y.morphNormals&&o.enable(7),y.morphColors&&o.enable(8),y.premultipliedAlpha&&o.enable(9),y.shadowMapEnabled&&o.enable(10),y.doubleSided&&o.enable(11),y.flipSided&&o.enable(12),y.useDepthPacking&&o.enable(13),y.dithering&&o.enable(14),y.transmission&&o.enable(15),y.sheen&&o.enable(16),y.opaque&&o.enable(17),y.pointsUvs&&o.enable(18),y.decodeVideoTexture&&o.enable(19),y.decodeVideoTextureEmissive&&o.enable(20),y.alphaToCoverage&&o.enable(21),_.push(o.mask)}function x(_){const y=g[_.type];let L;if(y){const U=pn[y];L=ep.clone(U.uniforms)}else L=_.uniforms;return L}function E(_,y){let L;for(let U=0,z=u.length;U<z;U++){const $=u[U];if($.cacheKey===y){L=$,++L.usedTimes;break}}return L===void 0&&(L=new hS(i,y,_,r),u.push(L)),L}function T(_){if(--_.usedTimes===0){const y=u.indexOf(_);u[y]=u[u.length-1],u.pop(),_.destroy()}}function C(_){l.remove(_)}function A(){l.dispose()}return{getParameters:m,getProgramCacheKey:p,getUniforms:x,acquireProgram:E,releaseProgram:T,releaseShaderCache:C,programs:u,dispose:A}}function mS(){let i=new WeakMap;function t(a){return i.has(a)}function e(a){let o=i.get(a);return o===void 0&&(o={},i.set(a,o)),o}function n(a){i.delete(a)}function s(a,o,l){i.get(a)[o]=l}function r(){i=new WeakMap}return{has:t,get:e,remove:n,update:s,dispose:r}}function gS(i,t){return i.groupOrder!==t.groupOrder?i.groupOrder-t.groupOrder:i.renderOrder!==t.renderOrder?i.renderOrder-t.renderOrder:i.material.id!==t.material.id?i.material.id-t.material.id:i.z!==t.z?i.z-t.z:i.id-t.id}function Jc(i,t){return i.groupOrder!==t.groupOrder?i.groupOrder-t.groupOrder:i.renderOrder!==t.renderOrder?i.renderOrder-t.renderOrder:i.z!==t.z?t.z-i.z:i.id-t.id}function Kc(){const i=[];let t=0;const e=[],n=[],s=[];function r(){t=0,e.length=0,n.length=0,s.length=0}function a(h,d,f,g,v,m){let p=i[t];return p===void 0?(p={id:h.id,object:h,geometry:d,material:f,groupOrder:g,renderOrder:h.renderOrder,z:v,group:m},i[t]=p):(p.id=h.id,p.object=h,p.geometry=d,p.material=f,p.groupOrder=g,p.renderOrder=h.renderOrder,p.z=v,p.group=m),t++,p}function o(h,d,f,g,v,m){const p=a(h,d,f,g,v,m);f.transmission>0?n.push(p):f.transparent===!0?s.push(p):e.push(p)}function l(h,d,f,g,v,m){const p=a(h,d,f,g,v,m);f.transmission>0?n.unshift(p):f.transparent===!0?s.unshift(p):e.unshift(p)}function c(h,d){e.length>1&&e.sort(h||gS),n.length>1&&n.sort(d||Jc),s.length>1&&s.sort(d||Jc)}function u(){for(let h=t,d=i.length;h<d;h++){const f=i[h];if(f.id===null)break;f.id=null,f.object=null,f.geometry=null,f.material=null,f.group=null}}return{opaque:e,transmissive:n,transparent:s,init:r,push:o,unshift:l,finish:u,sort:c}}function vS(){let i=new WeakMap;function t(n,s){const r=i.get(n);let a;return r===void 0?(a=new Kc,i.set(n,[a])):s>=r.length?(a=new Kc,r.push(a)):a=r[s],a}function e(){i=new WeakMap}return{get:t,dispose:e}}function SS(){const i={};return{get:function(t){if(i[t.id]!==void 0)return i[t.id];let e;switch(t.type){case"DirectionalLight":e={direction:new B,color:new Nt};break;case"SpotLight":e={position:new B,direction:new B,color:new Nt,distance:0,coneCos:0,penumbraCos:0,decay:0};break;case"PointLight":e={position:new B,color:new Nt,distance:0,decay:0};break;case"HemisphereLight":e={direction:new B,skyColor:new Nt,groundColor:new Nt};break;case"RectAreaLight":e={color:new Nt,position:new B,halfWidth:new B,halfHeight:new B};break}return i[t.id]=e,e}}}function xS(){const i={};return{get:function(t){if(i[t.id]!==void 0)return i[t.id];let e;switch(t.type){case"DirectionalLight":e={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new ft};break;case"SpotLight":e={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new ft};break;case"PointLight":e={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new ft,shadowCameraNear:1,shadowCameraFar:1e3};break}return i[t.id]=e,e}}}let _S=0;function yS(i,t){return(t.castShadow?2:0)-(i.castShadow?2:0)+(t.map?1:0)-(i.map?1:0)}function MS(i){const t=new SS,e=xS(),n={version:0,hash:{directionalLength:-1,pointLength:-1,spotLength:-1,rectAreaLength:-1,hemiLength:-1,numDirectionalShadows:-1,numPointShadows:-1,numSpotShadows:-1,numSpotMaps:-1,numLightProbes:-1},ambient:[0,0,0],probe:[],directional:[],directionalShadow:[],directionalShadowMap:[],directionalShadowMatrix:[],spot:[],spotLightMap:[],spotShadow:[],spotShadowMap:[],spotLightMatrix:[],rectArea:[],rectAreaLTC1:null,rectAreaLTC2:null,point:[],pointShadow:[],pointShadowMap:[],pointShadowMatrix:[],hemi:[],numSpotLightShadowsWithMaps:0,numLightProbes:0};for(let c=0;c<9;c++)n.probe.push(new B);const s=new B,r=new se,a=new se;function o(c){let u=0,h=0,d=0;for(let _=0;_<9;_++)n.probe[_].set(0,0,0);let f=0,g=0,v=0,m=0,p=0,M=0,b=0,x=0,E=0,T=0,C=0;c.sort(yS);for(let _=0,y=c.length;_<y;_++){const L=c[_],U=L.color,z=L.intensity,$=L.distance,X=L.shadow&&L.shadow.map?L.shadow.map.texture:null;if(L.isAmbientLight)u+=U.r*z,h+=U.g*z,d+=U.b*z;else if(L.isLightProbe){for(let q=0;q<9;q++)n.probe[q].addScaledVector(L.sh.coefficients[q],z);C++}else if(L.isDirectionalLight){const q=t.get(L);if(q.color.copy(L.color).multiplyScalar(L.intensity),L.castShadow){const Z=L.shadow,W=e.get(L);W.shadowIntensity=Z.intensity,W.shadowBias=Z.bias,W.shadowNormalBias=Z.normalBias,W.shadowRadius=Z.radius,W.shadowMapSize=Z.mapSize,n.directionalShadow[f]=W,n.directionalShadowMap[f]=X,n.directionalShadowMatrix[f]=L.shadow.matrix,M++}n.directional[f]=q,f++}else if(L.isSpotLight){const q=t.get(L);q.position.setFromMatrixPosition(L.matrixWorld),q.color.copy(U).multiplyScalar(z),q.distance=$,q.coneCos=Math.cos(L.angle),q.penumbraCos=Math.cos(L.angle*(1-L.penumbra)),q.decay=L.decay,n.spot[v]=q;const Z=L.shadow;if(L.map&&(n.spotLightMap[E]=L.map,E++,Z.updateMatrices(L),L.castShadow&&T++),n.spotLightMatrix[v]=Z.matrix,L.castShadow){const W=e.get(L);W.shadowIntensity=Z.intensity,W.shadowBias=Z.bias,W.shadowNormalBias=Z.normalBias,W.shadowRadius=Z.radius,W.shadowMapSize=Z.mapSize,n.spotShadow[v]=W,n.spotShadowMap[v]=X,x++}v++}else if(L.isRectAreaLight){const q=t.get(L);q.color.copy(U).multiplyScalar(z),q.halfWidth.set(L.width*.5,0,0),q.halfHeight.set(0,L.height*.5,0),n.rectArea[m]=q,m++}else if(L.isPointLight){const q=t.get(L);if(q.color.copy(L.color).multiplyScalar(L.intensity),q.distance=L.distance,q.decay=L.decay,L.castShadow){const Z=L.shadow,W=e.get(L);W.shadowIntensity=Z.intensity,W.shadowBias=Z.bias,W.shadowNormalBias=Z.normalBias,W.shadowRadius=Z.radius,W.shadowMapSize=Z.mapSize,W.shadowCameraNear=Z.camera.near,W.shadowCameraFar=Z.camera.far,n.pointShadow[g]=W,n.pointShadowMap[g]=X,n.pointShadowMatrix[g]=L.shadow.matrix,b++}n.point[g]=q,g++}else if(L.isHemisphereLight){const q=t.get(L);q.skyColor.copy(L.color).multiplyScalar(z),q.groundColor.copy(L.groundColor).multiplyScalar(z),n.hemi[p]=q,p++}}m>0&&(i.has("OES_texture_float_linear")===!0?(n.rectAreaLTC1=ct.LTC_FLOAT_1,n.rectAreaLTC2=ct.LTC_FLOAT_2):(n.rectAreaLTC1=ct.LTC_HALF_1,n.rectAreaLTC2=ct.LTC_HALF_2)),n.ambient[0]=u,n.ambient[1]=h,n.ambient[2]=d;const A=n.hash;(A.directionalLength!==f||A.pointLength!==g||A.spotLength!==v||A.rectAreaLength!==m||A.hemiLength!==p||A.numDirectionalShadows!==M||A.numPointShadows!==b||A.numSpotShadows!==x||A.numSpotMaps!==E||A.numLightProbes!==C)&&(n.directional.length=f,n.spot.length=v,n.rectArea.length=m,n.point.length=g,n.hemi.length=p,n.directionalShadow.length=M,n.directionalShadowMap.length=M,n.pointShadow.length=b,n.pointShadowMap.length=b,n.spotShadow.length=x,n.spotShadowMap.length=x,n.directionalShadowMatrix.length=M,n.pointShadowMatrix.length=b,n.spotLightMatrix.length=x+E-T,n.spotLightMap.length=E,n.numSpotLightShadowsWithMaps=T,n.numLightProbes=C,A.directionalLength=f,A.pointLength=g,A.spotLength=v,A.rectAreaLength=m,A.hemiLength=p,A.numDirectionalShadows=M,A.numPointShadows=b,A.numSpotShadows=x,A.numSpotMaps=E,A.numLightProbes=C,n.version=_S++)}function l(c,u){let h=0,d=0,f=0,g=0,v=0;const m=u.matrixWorldInverse;for(let p=0,M=c.length;p<M;p++){const b=c[p];if(b.isDirectionalLight){const x=n.directional[h];x.direction.setFromMatrixPosition(b.matrixWorld),s.setFromMatrixPosition(b.target.matrixWorld),x.direction.sub(s),x.direction.transformDirection(m),h++}else if(b.isSpotLight){const x=n.spot[f];x.position.setFromMatrixPosition(b.matrixWorld),x.position.applyMatrix4(m),x.direction.setFromMatrixPosition(b.matrixWorld),s.setFromMatrixPosition(b.target.matrixWorld),x.direction.sub(s),x.direction.transformDirection(m),f++}else if(b.isRectAreaLight){const x=n.rectArea[g];x.position.setFromMatrixPosition(b.matrixWorld),x.position.applyMatrix4(m),a.identity(),r.copy(b.matrixWorld),r.premultiply(m),a.extractRotation(r),x.halfWidth.set(b.width*.5,0,0),x.halfHeight.set(0,b.height*.5,0),x.halfWidth.applyMatrix4(a),x.halfHeight.applyMatrix4(a),g++}else if(b.isPointLight){const x=n.point[d];x.position.setFromMatrixPosition(b.matrixWorld),x.position.applyMatrix4(m),d++}else if(b.isHemisphereLight){const x=n.hemi[v];x.direction.setFromMatrixPosition(b.matrixWorld),x.direction.transformDirection(m),v++}}}return{setup:o,setupView:l,state:n}}function Zc(i){const t=new MS(i),e=[],n=[];function s(u){c.camera=u,e.length=0,n.length=0}function r(u){e.push(u)}function a(u){n.push(u)}function o(){t.setup(e)}function l(u){t.setupView(e,u)}const c={lightsArray:e,shadowsArray:n,camera:null,lights:t,transmissionRenderTarget:{}};return{init:s,state:c,setupLights:o,setupLightsView:l,pushLight:r,pushShadow:a}}function bS(i){let t=new WeakMap;function e(s,r=0){const a=t.get(s);let o;return a===void 0?(o=new Zc(i),t.set(s,[o])):r>=a.length?(o=new Zc(i),a.push(o)):o=a[r],o}function n(){t=new WeakMap}return{get:e,dispose:n}}const RS=`void main() {
	gl_Position = vec4( position, 1.0 );
}`,wS=`uniform sampler2D shadow_pass;
uniform vec2 resolution;
uniform float radius;
#include <packing>
void main() {
	const float samples = float( VSM_SAMPLES );
	float mean = 0.0;
	float squared_mean = 0.0;
	float uvStride = samples <= 1.0 ? 0.0 : 2.0 / ( samples - 1.0 );
	float uvStart = samples <= 1.0 ? 0.0 : - 1.0;
	for ( float i = 0.0; i < samples; i ++ ) {
		float uvOffset = uvStart + i * uvStride;
		#ifdef HORIZONTAL_PASS
			vec2 distribution = unpackRGBATo2Half( texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( uvOffset, 0.0 ) * radius ) / resolution ) );
			mean += distribution.x;
			squared_mean += distribution.y * distribution.y + distribution.x * distribution.x;
		#else
			float depth = unpackRGBAToDepth( texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( 0.0, uvOffset ) * radius ) / resolution ) );
			mean += depth;
			squared_mean += depth * depth;
		#endif
	}
	mean = mean / samples;
	squared_mean = squared_mean / samples;
	float std_dev = sqrt( squared_mean - mean * mean );
	gl_FragColor = pack2HalfToRGBA( vec2( mean, std_dev ) );
}`;function ES(i,t,e){let n=new hl;const s=new ft,r=new ft,a=new me,o=new Jp({depthPacking:wf}),l=new Kp,c={},u=e.maxTextureSize,h={[Yn]:Ie,[Ie]:Yn,[Pe]:Pe},d=new Jn({defines:{VSM_SAMPLES:8},uniforms:{shadow_pass:{value:null},resolution:{value:new ft},radius:{value:4}},vertexShader:RS,fragmentShader:wS}),f=d.clone();f.defines.HORIZONTAL_PASS=1;const g=new fe;g.setAttribute("position",new We(new Float32Array([-1,-1,.5,3,-1,.5,-1,3,.5]),3));const v=new Mt(g,d),m=this;this.enabled=!1,this.autoUpdate=!0,this.needsUpdate=!1,this.type=yh;let p=this.type;this.render=function(T,C,A){if(m.enabled===!1||m.autoUpdate===!1&&m.needsUpdate===!1||T.length===0)return;const _=i.getRenderTarget(),y=i.getActiveCubeFace(),L=i.getActiveMipmapLevel(),U=i.state;U.setBlending($n),U.buffers.depth.getReversed()===!0?U.buffers.color.setClear(0,0,0,0):U.buffers.color.setClear(1,1,1,1),U.buffers.depth.setTest(!0),U.setScissorTest(!1);const z=p!==Pn&&this.type===Pn,$=p===Pn&&this.type!==Pn;for(let X=0,q=T.length;X<q;X++){const Z=T[X],W=Z.shadow;if(W===void 0){console.warn("THREE.WebGLShadowMap:",Z,"has no shadow.");continue}if(W.autoUpdate===!1&&W.needsUpdate===!1)continue;s.copy(W.mapSize);const rt=W.getFrameExtents();if(s.multiply(rt),r.copy(W.mapSize),(s.x>u||s.y>u)&&(s.x>u&&(r.x=Math.floor(u/rt.x),s.x=r.x*rt.x,W.mapSize.x=r.x),s.y>u&&(r.y=Math.floor(u/rt.y),s.y=r.y*rt.y,W.mapSize.y=r.y)),W.map===null||z===!0||$===!0){const Et=this.type!==Pn?{minFilter:tn,magFilter:tn}:{};W.map!==null&&W.map.dispose(),W.map=new mi(s.x,s.y,Et),W.map.texture.name=Z.name+".shadowMap",W.camera.updateProjectionMatrix()}i.setRenderTarget(W.map),i.clear();const ut=W.getViewportCount();for(let Et=0;Et<ut;Et++){const kt=W.getViewport(Et);a.set(r.x*kt.x,r.y*kt.y,r.x*kt.z,r.y*kt.w),U.viewport(a),W.updateMatrices(Z,Et),n=W.getFrustum(),x(C,A,W.camera,Z,this.type)}W.isPointLightShadow!==!0&&this.type===Pn&&M(W,A),W.needsUpdate=!1}p=this.type,m.needsUpdate=!1,i.setRenderTarget(_,y,L)};function M(T,C){const A=t.update(v);d.defines.VSM_SAMPLES!==T.blurSamples&&(d.defines.VSM_SAMPLES=T.blurSamples,f.defines.VSM_SAMPLES=T.blurSamples,d.needsUpdate=!0,f.needsUpdate=!0),T.mapPass===null&&(T.mapPass=new mi(s.x,s.y)),d.uniforms.shadow_pass.value=T.map.texture,d.uniforms.resolution.value=T.mapSize,d.uniforms.radius.value=T.radius,i.setRenderTarget(T.mapPass),i.clear(),i.renderBufferDirect(C,null,A,d,v,null),f.uniforms.shadow_pass.value=T.mapPass.texture,f.uniforms.resolution.value=T.mapSize,f.uniforms.radius.value=T.radius,i.setRenderTarget(T.map),i.clear(),i.renderBufferDirect(C,null,A,f,v,null)}function b(T,C,A,_){let y=null;const L=A.isPointLight===!0?T.customDistanceMaterial:T.customDepthMaterial;if(L!==void 0)y=L;else if(y=A.isPointLight===!0?l:o,i.localClippingEnabled&&C.clipShadows===!0&&Array.isArray(C.clippingPlanes)&&C.clippingPlanes.length!==0||C.displacementMap&&C.displacementScale!==0||C.alphaMap&&C.alphaTest>0||C.map&&C.alphaTest>0||C.alphaToCoverage===!0){const U=y.uuid,z=C.uuid;let $=c[U];$===void 0&&($={},c[U]=$);let X=$[z];X===void 0&&(X=y.clone(),$[z]=X,C.addEventListener("dispose",E)),y=X}if(y.visible=C.visible,y.wireframe=C.wireframe,_===Pn?y.side=C.shadowSide!==null?C.shadowSide:C.side:y.side=C.shadowSide!==null?C.shadowSide:h[C.side],y.alphaMap=C.alphaMap,y.alphaTest=C.alphaToCoverage===!0?.5:C.alphaTest,y.map=C.map,y.clipShadows=C.clipShadows,y.clippingPlanes=C.clippingPlanes,y.clipIntersection=C.clipIntersection,y.displacementMap=C.displacementMap,y.displacementScale=C.displacementScale,y.displacementBias=C.displacementBias,y.wireframeLinewidth=C.wireframeLinewidth,y.linewidth=C.linewidth,A.isPointLight===!0&&y.isMeshDistanceMaterial===!0){const U=i.properties.get(y);U.light=A}return y}function x(T,C,A,_,y){if(T.visible===!1)return;if(T.layers.test(C.layers)&&(T.isMesh||T.isLine||T.isPoints)&&(T.castShadow||T.receiveShadow&&y===Pn)&&(!T.frustumCulled||n.intersectsObject(T))){T.modelViewMatrix.multiplyMatrices(A.matrixWorldInverse,T.matrixWorld);const z=t.update(T),$=T.material;if(Array.isArray($)){const X=z.groups;for(let q=0,Z=X.length;q<Z;q++){const W=X[q],rt=$[W.materialIndex];if(rt&&rt.visible){const ut=b(T,rt,_,y);T.onBeforeShadow(i,T,C,A,z,ut,W),i.renderBufferDirect(A,null,z,ut,T,W),T.onAfterShadow(i,T,C,A,z,ut,W)}}}else if($.visible){const X=b(T,$,_,y);T.onBeforeShadow(i,T,C,A,z,X,null),i.renderBufferDirect(A,null,z,X,T,null),T.onAfterShadow(i,T,C,A,z,X,null)}}const U=T.children;for(let z=0,$=U.length;z<$;z++)x(U[z],C,A,_,y)}function E(T){T.target.removeEventListener("dispose",E);for(const A in c){const _=c[A],y=T.target.uuid;y in _&&(_[y].dispose(),delete _[y])}}}const TS={[no]:io,[so]:oo,[ro]:lo,[Zi]:ao,[io]:no,[oo]:so,[lo]:ro,[ao]:Zi};function CS(i,t){function e(){let D=!1;const et=new me;let it=null;const dt=new me(0,0,0,0);return{setMask:function(Q){it!==Q&&!D&&(i.colorMask(Q,Q,Q,Q),it=Q)},setLocked:function(Q){D=Q},setClear:function(Q,J,xt,It,jt){jt===!0&&(Q*=It,J*=It,xt*=It),et.set(Q,J,xt,It),dt.equals(et)===!1&&(i.clearColor(Q,J,xt,It),dt.copy(et))},reset:function(){D=!1,it=null,dt.set(-1,0,0,0)}}}function n(){let D=!1,et=!1,it=null,dt=null,Q=null;return{setReversed:function(J){if(et!==J){const xt=t.get("EXT_clip_control");J?xt.clipControlEXT(xt.LOWER_LEFT_EXT,xt.ZERO_TO_ONE_EXT):xt.clipControlEXT(xt.LOWER_LEFT_EXT,xt.NEGATIVE_ONE_TO_ONE_EXT),et=J;const It=Q;Q=null,this.setClear(It)}},getReversed:function(){return et},setTest:function(J){J?j(i.DEPTH_TEST):mt(i.DEPTH_TEST)},setMask:function(J){it!==J&&!D&&(i.depthMask(J),it=J)},setFunc:function(J){if(et&&(J=TS[J]),dt!==J){switch(J){case no:i.depthFunc(i.NEVER);break;case io:i.depthFunc(i.ALWAYS);break;case so:i.depthFunc(i.LESS);break;case Zi:i.depthFunc(i.LEQUAL);break;case ro:i.depthFunc(i.EQUAL);break;case ao:i.depthFunc(i.GEQUAL);break;case oo:i.depthFunc(i.GREATER);break;case lo:i.depthFunc(i.NOTEQUAL);break;default:i.depthFunc(i.LEQUAL)}dt=J}},setLocked:function(J){D=J},setClear:function(J){Q!==J&&(et&&(J=1-J),i.clearDepth(J),Q=J)},reset:function(){D=!1,it=null,dt=null,Q=null,et=!1}}}function s(){let D=!1,et=null,it=null,dt=null,Q=null,J=null,xt=null,It=null,jt=null;return{setTest:function(Qt){D||(Qt?j(i.STENCIL_TEST):mt(i.STENCIL_TEST))},setMask:function(Qt){et!==Qt&&!D&&(i.stencilMask(Qt),et=Qt)},setFunc:function(Qt,Rn,fn){(it!==Qt||dt!==Rn||Q!==fn)&&(i.stencilFunc(Qt,Rn,fn),it=Qt,dt=Rn,Q=fn)},setOp:function(Qt,Rn,fn){(J!==Qt||xt!==Rn||It!==fn)&&(i.stencilOp(Qt,Rn,fn),J=Qt,xt=Rn,It=fn)},setLocked:function(Qt){D=Qt},setClear:function(Qt){jt!==Qt&&(i.clearStencil(Qt),jt=Qt)},reset:function(){D=!1,et=null,it=null,dt=null,Q=null,J=null,xt=null,It=null,jt=null}}}const r=new e,a=new n,o=new s,l=new WeakMap,c=new WeakMap;let u={},h={},d=new WeakMap,f=[],g=null,v=!1,m=null,p=null,M=null,b=null,x=null,E=null,T=null,C=new Nt(0,0,0),A=0,_=!1,y=null,L=null,U=null,z=null,$=null;const X=i.getParameter(i.MAX_COMBINED_TEXTURE_IMAGE_UNITS);let q=!1,Z=0;const W=i.getParameter(i.VERSION);W.indexOf("WebGL")!==-1?(Z=parseFloat(/^WebGL (\d)/.exec(W)[1]),q=Z>=1):W.indexOf("OpenGL ES")!==-1&&(Z=parseFloat(/^OpenGL ES (\d)/.exec(W)[1]),q=Z>=2);let rt=null,ut={};const Et=i.getParameter(i.SCISSOR_BOX),kt=i.getParameter(i.VIEWPORT),Zt=new me().fromArray(Et),ee=new me().fromArray(kt);function Yt(D,et,it,dt){const Q=new Uint8Array(4),J=i.createTexture();i.bindTexture(D,J),i.texParameteri(D,i.TEXTURE_MIN_FILTER,i.NEAREST),i.texParameteri(D,i.TEXTURE_MAG_FILTER,i.NEAREST);for(let xt=0;xt<it;xt++)D===i.TEXTURE_3D||D===i.TEXTURE_2D_ARRAY?i.texImage3D(et,0,i.RGBA,1,1,dt,0,i.RGBA,i.UNSIGNED_BYTE,Q):i.texImage2D(et+xt,0,i.RGBA,1,1,0,i.RGBA,i.UNSIGNED_BYTE,Q);return J}const K={};K[i.TEXTURE_2D]=Yt(i.TEXTURE_2D,i.TEXTURE_2D,1),K[i.TEXTURE_CUBE_MAP]=Yt(i.TEXTURE_CUBE_MAP,i.TEXTURE_CUBE_MAP_POSITIVE_X,6),K[i.TEXTURE_2D_ARRAY]=Yt(i.TEXTURE_2D_ARRAY,i.TEXTURE_2D_ARRAY,1,1),K[i.TEXTURE_3D]=Yt(i.TEXTURE_3D,i.TEXTURE_3D,1,1),r.setClear(0,0,0,1),a.setClear(1),o.setClear(0),j(i.DEPTH_TEST),a.setFunc(Zi),Tt(!1),vt(Ul),j(i.CULL_FACE),ne($n);function j(D){u[D]!==!0&&(i.enable(D),u[D]=!0)}function mt(D){u[D]!==!1&&(i.disable(D),u[D]=!1)}function Pt(D,et){return h[D]!==et?(i.bindFramebuffer(D,et),h[D]=et,D===i.DRAW_FRAMEBUFFER&&(h[i.FRAMEBUFFER]=et),D===i.FRAMEBUFFER&&(h[i.DRAW_FRAMEBUFFER]=et),!0):!1}function gt(D,et){let it=f,dt=!1;if(D){it=d.get(et),it===void 0&&(it=[],d.set(et,it));const Q=D.textures;if(it.length!==Q.length||it[0]!==i.COLOR_ATTACHMENT0){for(let J=0,xt=Q.length;J<xt;J++)it[J]=i.COLOR_ATTACHMENT0+J;it.length=Q.length,dt=!0}}else it[0]!==i.BACK&&(it[0]=i.BACK,dt=!0);dt&&i.drawBuffers(it)}function Vt(D){return g!==D?(i.useProgram(D),g=D,!0):!1}const we={[li]:i.FUNC_ADD,[Zd]:i.FUNC_SUBTRACT,[jd]:i.FUNC_REVERSE_SUBTRACT};we[Qd]=i.MIN,we[tf]=i.MAX;const P={[ef]:i.ZERO,[nf]:i.ONE,[sf]:i.SRC_COLOR,[to]:i.SRC_ALPHA,[hf]:i.SRC_ALPHA_SATURATE,[lf]:i.DST_COLOR,[af]:i.DST_ALPHA,[rf]:i.ONE_MINUS_SRC_COLOR,[eo]:i.ONE_MINUS_SRC_ALPHA,[cf]:i.ONE_MINUS_DST_COLOR,[of]:i.ONE_MINUS_DST_ALPHA,[uf]:i.CONSTANT_COLOR,[df]:i.ONE_MINUS_CONSTANT_COLOR,[ff]:i.CONSTANT_ALPHA,[pf]:i.ONE_MINUS_CONSTANT_ALPHA};function ne(D,et,it,dt,Q,J,xt,It,jt,Qt){if(D===$n){v===!0&&(mt(i.BLEND),v=!1);return}if(v===!1&&(j(i.BLEND),v=!0),D!==Kd){if(D!==m||Qt!==_){if((p!==li||x!==li)&&(i.blendEquation(i.FUNC_ADD),p=li,x=li),Qt)switch(D){case $i:i.blendFuncSeparate(i.ONE,i.ONE_MINUS_SRC_ALPHA,i.ONE,i.ONE_MINUS_SRC_ALPHA);break;case Qa:i.blendFunc(i.ONE,i.ONE);break;case Nl:i.blendFuncSeparate(i.ZERO,i.ONE_MINUS_SRC_COLOR,i.ZERO,i.ONE);break;case Ol:i.blendFuncSeparate(i.DST_COLOR,i.ONE_MINUS_SRC_ALPHA,i.ZERO,i.ONE);break;default:console.error("THREE.WebGLState: Invalid blending: ",D);break}else switch(D){case $i:i.blendFuncSeparate(i.SRC_ALPHA,i.ONE_MINUS_SRC_ALPHA,i.ONE,i.ONE_MINUS_SRC_ALPHA);break;case Qa:i.blendFuncSeparate(i.SRC_ALPHA,i.ONE,i.ONE,i.ONE);break;case Nl:console.error("THREE.WebGLState: SubtractiveBlending requires material.premultipliedAlpha = true");break;case Ol:console.error("THREE.WebGLState: MultiplyBlending requires material.premultipliedAlpha = true");break;default:console.error("THREE.WebGLState: Invalid blending: ",D);break}M=null,b=null,E=null,T=null,C.set(0,0,0),A=0,m=D,_=Qt}return}Q=Q||et,J=J||it,xt=xt||dt,(et!==p||Q!==x)&&(i.blendEquationSeparate(we[et],we[Q]),p=et,x=Q),(it!==M||dt!==b||J!==E||xt!==T)&&(i.blendFuncSeparate(P[it],P[dt],P[J],P[xt]),M=it,b=dt,E=J,T=xt),(It.equals(C)===!1||jt!==A)&&(i.blendColor(It.r,It.g,It.b,jt),C.copy(It),A=jt),m=D,_=!1}function Bt(D,et){D.side===Pe?mt(i.CULL_FACE):j(i.CULL_FACE);let it=D.side===Ie;et&&(it=!it),Tt(it),D.blending===$i&&D.transparent===!1?ne($n):ne(D.blending,D.blendEquation,D.blendSrc,D.blendDst,D.blendEquationAlpha,D.blendSrcAlpha,D.blendDstAlpha,D.blendColor,D.blendAlpha,D.premultipliedAlpha),a.setFunc(D.depthFunc),a.setTest(D.depthTest),a.setMask(D.depthWrite),r.setMask(D.colorWrite);const dt=D.stencilWrite;o.setTest(dt),dt&&(o.setMask(D.stencilWriteMask),o.setFunc(D.stencilFunc,D.stencilRef,D.stencilFuncMask),o.setOp(D.stencilFail,D.stencilZFail,D.stencilZPass)),St(D.polygonOffset,D.polygonOffsetFactor,D.polygonOffsetUnits),D.alphaToCoverage===!0?j(i.SAMPLE_ALPHA_TO_COVERAGE):mt(i.SAMPLE_ALPHA_TO_COVERAGE)}function Tt(D){y!==D&&(D?i.frontFace(i.CW):i.frontFace(i.CCW),y=D)}function vt(D){D!==Yd?(j(i.CULL_FACE),D!==L&&(D===Ul?i.cullFace(i.BACK):D===Jd?i.cullFace(i.FRONT):i.cullFace(i.FRONT_AND_BACK))):mt(i.CULL_FACE),L=D}function ie(D){D!==U&&(q&&i.lineWidth(D),U=D)}function St(D,et,it){D?(j(i.POLYGON_OFFSET_FILL),(z!==et||$!==it)&&(i.polygonOffset(et,it),z=et,$=it)):mt(i.POLYGON_OFFSET_FILL)}function Ot(D){D?j(i.SCISSOR_TEST):mt(i.SCISSOR_TEST)}function xe(D){D===void 0&&(D=i.TEXTURE0+X-1),rt!==D&&(i.activeTexture(D),rt=D)}function at(D,et,it){it===void 0&&(rt===null?it=i.TEXTURE0+X-1:it=rt);let dt=ut[it];dt===void 0&&(dt={type:void 0,texture:void 0},ut[it]=dt),(dt.type!==D||dt.texture!==et)&&(rt!==it&&(i.activeTexture(it),rt=it),i.bindTexture(D,et||K[D]),dt.type=D,dt.texture=et)}function w(){const D=ut[rt];D!==void 0&&D.type!==void 0&&(i.bindTexture(D.type,null),D.type=void 0,D.texture=void 0)}function S(){try{i.compressedTexImage2D(...arguments)}catch(D){console.error("THREE.WebGLState:",D)}}function F(){try{i.compressedTexImage3D(...arguments)}catch(D){console.error("THREE.WebGLState:",D)}}function k(){try{i.texSubImage2D(...arguments)}catch(D){console.error("THREE.WebGLState:",D)}}function Y(){try{i.texSubImage3D(...arguments)}catch(D){console.error("THREE.WebGLState:",D)}}function V(){try{i.compressedTexSubImage2D(...arguments)}catch(D){console.error("THREE.WebGLState:",D)}}function wt(){try{i.compressedTexSubImage3D(...arguments)}catch(D){console.error("THREE.WebGLState:",D)}}function st(){try{i.texStorage2D(...arguments)}catch(D){console.error("THREE.WebGLState:",D)}}function _t(){try{i.texStorage3D(...arguments)}catch(D){console.error("THREE.WebGLState:",D)}}function bt(){try{i.texImage2D(...arguments)}catch(D){console.error("THREE.WebGLState:",D)}}function tt(){try{i.texImage3D(...arguments)}catch(D){console.error("THREE.WebGLState:",D)}}function ot(D){Zt.equals(D)===!1&&(i.scissor(D.x,D.y,D.z,D.w),Zt.copy(D))}function Lt(D){ee.equals(D)===!1&&(i.viewport(D.x,D.y,D.z,D.w),ee.copy(D))}function Rt(D,et){let it=c.get(et);it===void 0&&(it=new WeakMap,c.set(et,it));let dt=it.get(D);dt===void 0&&(dt=i.getUniformBlockIndex(et,D.name),it.set(D,dt))}function lt(D,et){const dt=c.get(et).get(D);l.get(et)!==dt&&(i.uniformBlockBinding(et,dt,D.__bindingPointIndex),l.set(et,dt))}function Ut(){i.disable(i.BLEND),i.disable(i.CULL_FACE),i.disable(i.DEPTH_TEST),i.disable(i.POLYGON_OFFSET_FILL),i.disable(i.SCISSOR_TEST),i.disable(i.STENCIL_TEST),i.disable(i.SAMPLE_ALPHA_TO_COVERAGE),i.blendEquation(i.FUNC_ADD),i.blendFunc(i.ONE,i.ZERO),i.blendFuncSeparate(i.ONE,i.ZERO,i.ONE,i.ZERO),i.blendColor(0,0,0,0),i.colorMask(!0,!0,!0,!0),i.clearColor(0,0,0,0),i.depthMask(!0),i.depthFunc(i.LESS),a.setReversed(!1),i.clearDepth(1),i.stencilMask(4294967295),i.stencilFunc(i.ALWAYS,0,4294967295),i.stencilOp(i.KEEP,i.KEEP,i.KEEP),i.clearStencil(0),i.cullFace(i.BACK),i.frontFace(i.CCW),i.polygonOffset(0,0),i.activeTexture(i.TEXTURE0),i.bindFramebuffer(i.FRAMEBUFFER,null),i.bindFramebuffer(i.DRAW_FRAMEBUFFER,null),i.bindFramebuffer(i.READ_FRAMEBUFFER,null),i.useProgram(null),i.lineWidth(1),i.scissor(0,0,i.canvas.width,i.canvas.height),i.viewport(0,0,i.canvas.width,i.canvas.height),u={},rt=null,ut={},h={},d=new WeakMap,f=[],g=null,v=!1,m=null,p=null,M=null,b=null,x=null,E=null,T=null,C=new Nt(0,0,0),A=0,_=!1,y=null,L=null,U=null,z=null,$=null,Zt.set(0,0,i.canvas.width,i.canvas.height),ee.set(0,0,i.canvas.width,i.canvas.height),r.reset(),a.reset(),o.reset()}return{buffers:{color:r,depth:a,stencil:o},enable:j,disable:mt,bindFramebuffer:Pt,drawBuffers:gt,useProgram:Vt,setBlending:ne,setMaterial:Bt,setFlipSided:Tt,setCullFace:vt,setLineWidth:ie,setPolygonOffset:St,setScissorTest:Ot,activeTexture:xe,bindTexture:at,unbindTexture:w,compressedTexImage2D:S,compressedTexImage3D:F,texImage2D:bt,texImage3D:tt,updateUBOMapping:Rt,uniformBlockBinding:lt,texStorage2D:st,texStorage3D:_t,texSubImage2D:k,texSubImage3D:Y,compressedTexSubImage2D:V,compressedTexSubImage3D:wt,scissor:ot,viewport:Lt,reset:Ut}}function AS(i,t,e,n,s,r,a){const o=t.has("WEBGL_multisampled_render_to_texture")?t.get("WEBGL_multisampled_render_to_texture"):null,l=typeof navigator>"u"?!1:/OculusBrowser/g.test(navigator.userAgent),c=new ft,u=new WeakMap;let h;const d=new WeakMap;let f=!1;try{f=typeof OffscreenCanvas<"u"&&new OffscreenCanvas(1,1).getContext("2d")!==null}catch{}function g(w,S){return f?new OffscreenCanvas(w,S):qr("canvas")}function v(w,S,F){let k=1;const Y=at(w);if((Y.width>F||Y.height>F)&&(k=F/Math.max(Y.width,Y.height)),k<1)if(typeof HTMLImageElement<"u"&&w instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&w instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&w instanceof ImageBitmap||typeof VideoFrame<"u"&&w instanceof VideoFrame){const V=Math.floor(k*Y.width),wt=Math.floor(k*Y.height);h===void 0&&(h=g(V,wt));const st=S?g(V,wt):h;return st.width=V,st.height=wt,st.getContext("2d").drawImage(w,0,0,V,wt),console.warn("THREE.WebGLRenderer: Texture has been resized from ("+Y.width+"x"+Y.height+") to ("+V+"x"+wt+")."),st}else return"data"in w&&console.warn("THREE.WebGLRenderer: Image in DataTexture is too big ("+Y.width+"x"+Y.height+")."),w;return w}function m(w){return w.generateMipmaps}function p(w){i.generateMipmap(w)}function M(w){return w.isWebGLCubeRenderTarget?i.TEXTURE_CUBE_MAP:w.isWebGL3DRenderTarget?i.TEXTURE_3D:w.isWebGLArrayRenderTarget||w.isCompressedArrayTexture?i.TEXTURE_2D_ARRAY:i.TEXTURE_2D}function b(w,S,F,k,Y=!1){if(w!==null){if(i[w]!==void 0)return i[w];console.warn("THREE.WebGLRenderer: Attempt to use non-existing WebGL internal format '"+w+"'")}let V=S;if(S===i.RED&&(F===i.FLOAT&&(V=i.R32F),F===i.HALF_FLOAT&&(V=i.R16F),F===i.UNSIGNED_BYTE&&(V=i.R8)),S===i.RED_INTEGER&&(F===i.UNSIGNED_BYTE&&(V=i.R8UI),F===i.UNSIGNED_SHORT&&(V=i.R16UI),F===i.UNSIGNED_INT&&(V=i.R32UI),F===i.BYTE&&(V=i.R8I),F===i.SHORT&&(V=i.R16I),F===i.INT&&(V=i.R32I)),S===i.RG&&(F===i.FLOAT&&(V=i.RG32F),F===i.HALF_FLOAT&&(V=i.RG16F),F===i.UNSIGNED_BYTE&&(V=i.RG8)),S===i.RG_INTEGER&&(F===i.UNSIGNED_BYTE&&(V=i.RG8UI),F===i.UNSIGNED_SHORT&&(V=i.RG16UI),F===i.UNSIGNED_INT&&(V=i.RG32UI),F===i.BYTE&&(V=i.RG8I),F===i.SHORT&&(V=i.RG16I),F===i.INT&&(V=i.RG32I)),S===i.RGB_INTEGER&&(F===i.UNSIGNED_BYTE&&(V=i.RGB8UI),F===i.UNSIGNED_SHORT&&(V=i.RGB16UI),F===i.UNSIGNED_INT&&(V=i.RGB32UI),F===i.BYTE&&(V=i.RGB8I),F===i.SHORT&&(V=i.RGB16I),F===i.INT&&(V=i.RGB32I)),S===i.RGBA_INTEGER&&(F===i.UNSIGNED_BYTE&&(V=i.RGBA8UI),F===i.UNSIGNED_SHORT&&(V=i.RGBA16UI),F===i.UNSIGNED_INT&&(V=i.RGBA32UI),F===i.BYTE&&(V=i.RGBA8I),F===i.SHORT&&(V=i.RGBA16I),F===i.INT&&(V=i.RGBA32I)),S===i.RGB&&(F===i.UNSIGNED_INT_5_9_9_9_REV&&(V=i.RGB9_E5),F===i.UNSIGNED_INT_10F_11F_11F_REV&&(V=i.R11F_G11F_B10F)),S===i.RGBA){const wt=Y?$r:Kt.getTransfer(k);F===i.FLOAT&&(V=i.RGBA32F),F===i.HALF_FLOAT&&(V=i.RGBA16F),F===i.UNSIGNED_BYTE&&(V=wt===ae?i.SRGB8_ALPHA8:i.RGBA8),F===i.UNSIGNED_SHORT_4_4_4_4&&(V=i.RGBA4),F===i.UNSIGNED_SHORT_5_5_5_1&&(V=i.RGB5_A1)}return(V===i.R16F||V===i.R32F||V===i.RG16F||V===i.RG32F||V===i.RGBA16F||V===i.RGBA32F)&&t.get("EXT_color_buffer_float"),V}function x(w,S){let F;return w?S===null||S===pi||S===Ds?F=i.DEPTH24_STENCIL8:S===vn?F=i.DEPTH32F_STENCIL8:S===Is&&(F=i.DEPTH24_STENCIL8,console.warn("DepthTexture: 16 bit depth attachment is not supported with stencil. Using 24-bit attachment.")):S===null||S===pi||S===Ds?F=i.DEPTH_COMPONENT24:S===vn?F=i.DEPTH_COMPONENT32F:S===Is&&(F=i.DEPTH_COMPONENT16),F}function E(w,S){return m(w)===!0||w.isFramebufferTexture&&w.minFilter!==tn&&w.minFilter!==gn?Math.log2(Math.max(S.width,S.height))+1:w.mipmaps!==void 0&&w.mipmaps.length>0?w.mipmaps.length:w.isCompressedTexture&&Array.isArray(w.image)?S.mipmaps.length:1}function T(w){const S=w.target;S.removeEventListener("dispose",T),A(S),S.isVideoTexture&&u.delete(S)}function C(w){const S=w.target;S.removeEventListener("dispose",C),y(S)}function A(w){const S=n.get(w);if(S.__webglInit===void 0)return;const F=w.source,k=d.get(F);if(k){const Y=k[S.__cacheKey];Y.usedTimes--,Y.usedTimes===0&&_(w),Object.keys(k).length===0&&d.delete(F)}n.remove(w)}function _(w){const S=n.get(w);i.deleteTexture(S.__webglTexture);const F=w.source,k=d.get(F);delete k[S.__cacheKey],a.memory.textures--}function y(w){const S=n.get(w);if(w.depthTexture&&(w.depthTexture.dispose(),n.remove(w.depthTexture)),w.isWebGLCubeRenderTarget)for(let k=0;k<6;k++){if(Array.isArray(S.__webglFramebuffer[k]))for(let Y=0;Y<S.__webglFramebuffer[k].length;Y++)i.deleteFramebuffer(S.__webglFramebuffer[k][Y]);else i.deleteFramebuffer(S.__webglFramebuffer[k]);S.__webglDepthbuffer&&i.deleteRenderbuffer(S.__webglDepthbuffer[k])}else{if(Array.isArray(S.__webglFramebuffer))for(let k=0;k<S.__webglFramebuffer.length;k++)i.deleteFramebuffer(S.__webglFramebuffer[k]);else i.deleteFramebuffer(S.__webglFramebuffer);if(S.__webglDepthbuffer&&i.deleteRenderbuffer(S.__webglDepthbuffer),S.__webglMultisampledFramebuffer&&i.deleteFramebuffer(S.__webglMultisampledFramebuffer),S.__webglColorRenderbuffer)for(let k=0;k<S.__webglColorRenderbuffer.length;k++)S.__webglColorRenderbuffer[k]&&i.deleteRenderbuffer(S.__webglColorRenderbuffer[k]);S.__webglDepthRenderbuffer&&i.deleteRenderbuffer(S.__webglDepthRenderbuffer)}const F=w.textures;for(let k=0,Y=F.length;k<Y;k++){const V=n.get(F[k]);V.__webglTexture&&(i.deleteTexture(V.__webglTexture),a.memory.textures--),n.remove(F[k])}n.remove(w)}let L=0;function U(){L=0}function z(){const w=L;return w>=s.maxTextures&&console.warn("THREE.WebGLTextures: Trying to use "+w+" texture units while this GPU supports only "+s.maxTextures),L+=1,w}function $(w){const S=[];return S.push(w.wrapS),S.push(w.wrapT),S.push(w.wrapR||0),S.push(w.magFilter),S.push(w.minFilter),S.push(w.anisotropy),S.push(w.internalFormat),S.push(w.format),S.push(w.type),S.push(w.generateMipmaps),S.push(w.premultiplyAlpha),S.push(w.flipY),S.push(w.unpackAlignment),S.push(w.colorSpace),S.join()}function X(w,S){const F=n.get(w);if(w.isVideoTexture&&Ot(w),w.isRenderTargetTexture===!1&&w.isExternalTexture!==!0&&w.version>0&&F.__version!==w.version){const k=w.image;if(k===null)console.warn("THREE.WebGLRenderer: Texture marked for update but no image data found.");else if(k.complete===!1)console.warn("THREE.WebGLRenderer: Texture marked for update but image is incomplete");else{K(F,w,S);return}}else w.isExternalTexture&&(F.__webglTexture=w.sourceTexture?w.sourceTexture:null);e.bindTexture(i.TEXTURE_2D,F.__webglTexture,i.TEXTURE0+S)}function q(w,S){const F=n.get(w);if(w.isRenderTargetTexture===!1&&w.version>0&&F.__version!==w.version){K(F,w,S);return}e.bindTexture(i.TEXTURE_2D_ARRAY,F.__webglTexture,i.TEXTURE0+S)}function Z(w,S){const F=n.get(w);if(w.isRenderTargetTexture===!1&&w.version>0&&F.__version!==w.version){K(F,w,S);return}e.bindTexture(i.TEXTURE_3D,F.__webglTexture,i.TEXTURE0+S)}function W(w,S){const F=n.get(w);if(w.version>0&&F.__version!==w.version){j(F,w,S);return}e.bindTexture(i.TEXTURE_CUBE_MAP,F.__webglTexture,i.TEXTURE0+S)}const rt={[ts]:i.REPEAT,[ui]:i.CLAMP_TO_EDGE,[uo]:i.MIRRORED_REPEAT},ut={[tn]:i.NEAREST,[bf]:i.NEAREST_MIPMAP_NEAREST,[qs]:i.NEAREST_MIPMAP_LINEAR,[gn]:i.LINEAR,[la]:i.LINEAR_MIPMAP_NEAREST,[di]:i.LINEAR_MIPMAP_LINEAR},Et={[Tf]:i.NEVER,[If]:i.ALWAYS,[Cf]:i.LESS,[Dh]:i.LEQUAL,[Af]:i.EQUAL,[Ff]:i.GEQUAL,[Lf]:i.GREATER,[Pf]:i.NOTEQUAL};function kt(w,S){if(S.type===vn&&t.has("OES_texture_float_linear")===!1&&(S.magFilter===gn||S.magFilter===la||S.magFilter===qs||S.magFilter===di||S.minFilter===gn||S.minFilter===la||S.minFilter===qs||S.minFilter===di)&&console.warn("THREE.WebGLRenderer: Unable to use linear filtering with floating point textures. OES_texture_float_linear not supported on this device."),i.texParameteri(w,i.TEXTURE_WRAP_S,rt[S.wrapS]),i.texParameteri(w,i.TEXTURE_WRAP_T,rt[S.wrapT]),(w===i.TEXTURE_3D||w===i.TEXTURE_2D_ARRAY)&&i.texParameteri(w,i.TEXTURE_WRAP_R,rt[S.wrapR]),i.texParameteri(w,i.TEXTURE_MAG_FILTER,ut[S.magFilter]),i.texParameteri(w,i.TEXTURE_MIN_FILTER,ut[S.minFilter]),S.compareFunction&&(i.texParameteri(w,i.TEXTURE_COMPARE_MODE,i.COMPARE_REF_TO_TEXTURE),i.texParameteri(w,i.TEXTURE_COMPARE_FUNC,Et[S.compareFunction])),t.has("EXT_texture_filter_anisotropic")===!0){if(S.magFilter===tn||S.minFilter!==qs&&S.minFilter!==di||S.type===vn&&t.has("OES_texture_float_linear")===!1)return;if(S.anisotropy>1||n.get(S).__currentAnisotropy){const F=t.get("EXT_texture_filter_anisotropic");i.texParameterf(w,F.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(S.anisotropy,s.getMaxAnisotropy())),n.get(S).__currentAnisotropy=S.anisotropy}}}function Zt(w,S){let F=!1;w.__webglInit===void 0&&(w.__webglInit=!0,S.addEventListener("dispose",T));const k=S.source;let Y=d.get(k);Y===void 0&&(Y={},d.set(k,Y));const V=$(S);if(V!==w.__cacheKey){Y[V]===void 0&&(Y[V]={texture:i.createTexture(),usedTimes:0},a.memory.textures++,F=!0),Y[V].usedTimes++;const wt=Y[w.__cacheKey];wt!==void 0&&(Y[w.__cacheKey].usedTimes--,wt.usedTimes===0&&_(S)),w.__cacheKey=V,w.__webglTexture=Y[V].texture}return F}function ee(w,S,F){return Math.floor(Math.floor(w/F)/S)}function Yt(w,S,F,k){const V=w.updateRanges;if(V.length===0)e.texSubImage2D(i.TEXTURE_2D,0,0,0,S.width,S.height,F,k,S.data);else{V.sort((tt,ot)=>tt.start-ot.start);let wt=0;for(let tt=1;tt<V.length;tt++){const ot=V[wt],Lt=V[tt],Rt=ot.start+ot.count,lt=ee(Lt.start,S.width,4),Ut=ee(ot.start,S.width,4);Lt.start<=Rt+1&&lt===Ut&&ee(Lt.start+Lt.count-1,S.width,4)===lt?ot.count=Math.max(ot.count,Lt.start+Lt.count-ot.start):(++wt,V[wt]=Lt)}V.length=wt+1;const st=i.getParameter(i.UNPACK_ROW_LENGTH),_t=i.getParameter(i.UNPACK_SKIP_PIXELS),bt=i.getParameter(i.UNPACK_SKIP_ROWS);i.pixelStorei(i.UNPACK_ROW_LENGTH,S.width);for(let tt=0,ot=V.length;tt<ot;tt++){const Lt=V[tt],Rt=Math.floor(Lt.start/4),lt=Math.ceil(Lt.count/4),Ut=Rt%S.width,D=Math.floor(Rt/S.width),et=lt,it=1;i.pixelStorei(i.UNPACK_SKIP_PIXELS,Ut),i.pixelStorei(i.UNPACK_SKIP_ROWS,D),e.texSubImage2D(i.TEXTURE_2D,0,Ut,D,et,it,F,k,S.data)}w.clearUpdateRanges(),i.pixelStorei(i.UNPACK_ROW_LENGTH,st),i.pixelStorei(i.UNPACK_SKIP_PIXELS,_t),i.pixelStorei(i.UNPACK_SKIP_ROWS,bt)}}function K(w,S,F){let k=i.TEXTURE_2D;(S.isDataArrayTexture||S.isCompressedArrayTexture)&&(k=i.TEXTURE_2D_ARRAY),S.isData3DTexture&&(k=i.TEXTURE_3D);const Y=Zt(w,S),V=S.source;e.bindTexture(k,w.__webglTexture,i.TEXTURE0+F);const wt=n.get(V);if(V.version!==wt.__version||Y===!0){e.activeTexture(i.TEXTURE0+F);const st=Kt.getPrimaries(Kt.workingColorSpace),_t=S.colorSpace===Gn?null:Kt.getPrimaries(S.colorSpace),bt=S.colorSpace===Gn||st===_t?i.NONE:i.BROWSER_DEFAULT_WEBGL;i.pixelStorei(i.UNPACK_FLIP_Y_WEBGL,S.flipY),i.pixelStorei(i.UNPACK_PREMULTIPLY_ALPHA_WEBGL,S.premultiplyAlpha),i.pixelStorei(i.UNPACK_ALIGNMENT,S.unpackAlignment),i.pixelStorei(i.UNPACK_COLORSPACE_CONVERSION_WEBGL,bt);let tt=v(S.image,!1,s.maxTextureSize);tt=xe(S,tt);const ot=r.convert(S.format,S.colorSpace),Lt=r.convert(S.type);let Rt=b(S.internalFormat,ot,Lt,S.colorSpace,S.isVideoTexture);kt(k,S);let lt;const Ut=S.mipmaps,D=S.isVideoTexture!==!0,et=wt.__version===void 0||Y===!0,it=V.dataReady,dt=E(S,tt);if(S.isDepthTexture)Rt=x(S.format===Us,S.type),et&&(D?e.texStorage2D(i.TEXTURE_2D,1,Rt,tt.width,tt.height):e.texImage2D(i.TEXTURE_2D,0,Rt,tt.width,tt.height,0,ot,Lt,null));else if(S.isDataTexture)if(Ut.length>0){D&&et&&e.texStorage2D(i.TEXTURE_2D,dt,Rt,Ut[0].width,Ut[0].height);for(let Q=0,J=Ut.length;Q<J;Q++)lt=Ut[Q],D?it&&e.texSubImage2D(i.TEXTURE_2D,Q,0,0,lt.width,lt.height,ot,Lt,lt.data):e.texImage2D(i.TEXTURE_2D,Q,Rt,lt.width,lt.height,0,ot,Lt,lt.data);S.generateMipmaps=!1}else D?(et&&e.texStorage2D(i.TEXTURE_2D,dt,Rt,tt.width,tt.height),it&&Yt(S,tt,ot,Lt)):e.texImage2D(i.TEXTURE_2D,0,Rt,tt.width,tt.height,0,ot,Lt,tt.data);else if(S.isCompressedTexture)if(S.isCompressedArrayTexture){D&&et&&e.texStorage3D(i.TEXTURE_2D_ARRAY,dt,Rt,Ut[0].width,Ut[0].height,tt.depth);for(let Q=0,J=Ut.length;Q<J;Q++)if(lt=Ut[Q],S.format!==dn)if(ot!==null)if(D){if(it)if(S.layerUpdates.size>0){const xt=Tc(lt.width,lt.height,S.format,S.type);for(const It of S.layerUpdates){const jt=lt.data.subarray(It*xt/lt.data.BYTES_PER_ELEMENT,(It+1)*xt/lt.data.BYTES_PER_ELEMENT);e.compressedTexSubImage3D(i.TEXTURE_2D_ARRAY,Q,0,0,It,lt.width,lt.height,1,ot,jt)}S.clearLayerUpdates()}else e.compressedTexSubImage3D(i.TEXTURE_2D_ARRAY,Q,0,0,0,lt.width,lt.height,tt.depth,ot,lt.data)}else e.compressedTexImage3D(i.TEXTURE_2D_ARRAY,Q,Rt,lt.width,lt.height,tt.depth,0,lt.data,0,0);else console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()");else D?it&&e.texSubImage3D(i.TEXTURE_2D_ARRAY,Q,0,0,0,lt.width,lt.height,tt.depth,ot,Lt,lt.data):e.texImage3D(i.TEXTURE_2D_ARRAY,Q,Rt,lt.width,lt.height,tt.depth,0,ot,Lt,lt.data)}else{D&&et&&e.texStorage2D(i.TEXTURE_2D,dt,Rt,Ut[0].width,Ut[0].height);for(let Q=0,J=Ut.length;Q<J;Q++)lt=Ut[Q],S.format!==dn?ot!==null?D?it&&e.compressedTexSubImage2D(i.TEXTURE_2D,Q,0,0,lt.width,lt.height,ot,lt.data):e.compressedTexImage2D(i.TEXTURE_2D,Q,Rt,lt.width,lt.height,0,lt.data):console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()"):D?it&&e.texSubImage2D(i.TEXTURE_2D,Q,0,0,lt.width,lt.height,ot,Lt,lt.data):e.texImage2D(i.TEXTURE_2D,Q,Rt,lt.width,lt.height,0,ot,Lt,lt.data)}else if(S.isDataArrayTexture)if(D){if(et&&e.texStorage3D(i.TEXTURE_2D_ARRAY,dt,Rt,tt.width,tt.height,tt.depth),it)if(S.layerUpdates.size>0){const Q=Tc(tt.width,tt.height,S.format,S.type);for(const J of S.layerUpdates){const xt=tt.data.subarray(J*Q/tt.data.BYTES_PER_ELEMENT,(J+1)*Q/tt.data.BYTES_PER_ELEMENT);e.texSubImage3D(i.TEXTURE_2D_ARRAY,0,0,0,J,tt.width,tt.height,1,ot,Lt,xt)}S.clearLayerUpdates()}else e.texSubImage3D(i.TEXTURE_2D_ARRAY,0,0,0,0,tt.width,tt.height,tt.depth,ot,Lt,tt.data)}else e.texImage3D(i.TEXTURE_2D_ARRAY,0,Rt,tt.width,tt.height,tt.depth,0,ot,Lt,tt.data);else if(S.isData3DTexture)D?(et&&e.texStorage3D(i.TEXTURE_3D,dt,Rt,tt.width,tt.height,tt.depth),it&&e.texSubImage3D(i.TEXTURE_3D,0,0,0,0,tt.width,tt.height,tt.depth,ot,Lt,tt.data)):e.texImage3D(i.TEXTURE_3D,0,Rt,tt.width,tt.height,tt.depth,0,ot,Lt,tt.data);else if(S.isFramebufferTexture){if(et)if(D)e.texStorage2D(i.TEXTURE_2D,dt,Rt,tt.width,tt.height);else{let Q=tt.width,J=tt.height;for(let xt=0;xt<dt;xt++)e.texImage2D(i.TEXTURE_2D,xt,Rt,Q,J,0,ot,Lt,null),Q>>=1,J>>=1}}else if(Ut.length>0){if(D&&et){const Q=at(Ut[0]);e.texStorage2D(i.TEXTURE_2D,dt,Rt,Q.width,Q.height)}for(let Q=0,J=Ut.length;Q<J;Q++)lt=Ut[Q],D?it&&e.texSubImage2D(i.TEXTURE_2D,Q,0,0,ot,Lt,lt):e.texImage2D(i.TEXTURE_2D,Q,Rt,ot,Lt,lt);S.generateMipmaps=!1}else if(D){if(et){const Q=at(tt);e.texStorage2D(i.TEXTURE_2D,dt,Rt,Q.width,Q.height)}it&&e.texSubImage2D(i.TEXTURE_2D,0,0,0,ot,Lt,tt)}else e.texImage2D(i.TEXTURE_2D,0,Rt,ot,Lt,tt);m(S)&&p(k),wt.__version=V.version,S.onUpdate&&S.onUpdate(S)}w.__version=S.version}function j(w,S,F){if(S.image.length!==6)return;const k=Zt(w,S),Y=S.source;e.bindTexture(i.TEXTURE_CUBE_MAP,w.__webglTexture,i.TEXTURE0+F);const V=n.get(Y);if(Y.version!==V.__version||k===!0){e.activeTexture(i.TEXTURE0+F);const wt=Kt.getPrimaries(Kt.workingColorSpace),st=S.colorSpace===Gn?null:Kt.getPrimaries(S.colorSpace),_t=S.colorSpace===Gn||wt===st?i.NONE:i.BROWSER_DEFAULT_WEBGL;i.pixelStorei(i.UNPACK_FLIP_Y_WEBGL,S.flipY),i.pixelStorei(i.UNPACK_PREMULTIPLY_ALPHA_WEBGL,S.premultiplyAlpha),i.pixelStorei(i.UNPACK_ALIGNMENT,S.unpackAlignment),i.pixelStorei(i.UNPACK_COLORSPACE_CONVERSION_WEBGL,_t);const bt=S.isCompressedTexture||S.image[0].isCompressedTexture,tt=S.image[0]&&S.image[0].isDataTexture,ot=[];for(let J=0;J<6;J++)!bt&&!tt?ot[J]=v(S.image[J],!0,s.maxCubemapSize):ot[J]=tt?S.image[J].image:S.image[J],ot[J]=xe(S,ot[J]);const Lt=ot[0],Rt=r.convert(S.format,S.colorSpace),lt=r.convert(S.type),Ut=b(S.internalFormat,Rt,lt,S.colorSpace),D=S.isVideoTexture!==!0,et=V.__version===void 0||k===!0,it=Y.dataReady;let dt=E(S,Lt);kt(i.TEXTURE_CUBE_MAP,S);let Q;if(bt){D&&et&&e.texStorage2D(i.TEXTURE_CUBE_MAP,dt,Ut,Lt.width,Lt.height);for(let J=0;J<6;J++){Q=ot[J].mipmaps;for(let xt=0;xt<Q.length;xt++){const It=Q[xt];S.format!==dn?Rt!==null?D?it&&e.compressedTexSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+J,xt,0,0,It.width,It.height,Rt,It.data):e.compressedTexImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+J,xt,Ut,It.width,It.height,0,It.data):console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()"):D?it&&e.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+J,xt,0,0,It.width,It.height,Rt,lt,It.data):e.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+J,xt,Ut,It.width,It.height,0,Rt,lt,It.data)}}}else{if(Q=S.mipmaps,D&&et){Q.length>0&&dt++;const J=at(ot[0]);e.texStorage2D(i.TEXTURE_CUBE_MAP,dt,Ut,J.width,J.height)}for(let J=0;J<6;J++)if(tt){D?it&&e.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+J,0,0,0,ot[J].width,ot[J].height,Rt,lt,ot[J].data):e.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+J,0,Ut,ot[J].width,ot[J].height,0,Rt,lt,ot[J].data);for(let xt=0;xt<Q.length;xt++){const jt=Q[xt].image[J].image;D?it&&e.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+J,xt+1,0,0,jt.width,jt.height,Rt,lt,jt.data):e.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+J,xt+1,Ut,jt.width,jt.height,0,Rt,lt,jt.data)}}else{D?it&&e.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+J,0,0,0,Rt,lt,ot[J]):e.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+J,0,Ut,Rt,lt,ot[J]);for(let xt=0;xt<Q.length;xt++){const It=Q[xt];D?it&&e.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+J,xt+1,0,0,Rt,lt,It.image[J]):e.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+J,xt+1,Ut,Rt,lt,It.image[J])}}}m(S)&&p(i.TEXTURE_CUBE_MAP),V.__version=Y.version,S.onUpdate&&S.onUpdate(S)}w.__version=S.version}function mt(w,S,F,k,Y,V){const wt=r.convert(F.format,F.colorSpace),st=r.convert(F.type),_t=b(F.internalFormat,wt,st,F.colorSpace),bt=n.get(S),tt=n.get(F);if(tt.__renderTarget=S,!bt.__hasExternalTextures){const ot=Math.max(1,S.width>>V),Lt=Math.max(1,S.height>>V);Y===i.TEXTURE_3D||Y===i.TEXTURE_2D_ARRAY?e.texImage3D(Y,V,_t,ot,Lt,S.depth,0,wt,st,null):e.texImage2D(Y,V,_t,ot,Lt,0,wt,st,null)}e.bindFramebuffer(i.FRAMEBUFFER,w),St(S)?o.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER,k,Y,tt.__webglTexture,0,ie(S)):(Y===i.TEXTURE_2D||Y>=i.TEXTURE_CUBE_MAP_POSITIVE_X&&Y<=i.TEXTURE_CUBE_MAP_NEGATIVE_Z)&&i.framebufferTexture2D(i.FRAMEBUFFER,k,Y,tt.__webglTexture,V),e.bindFramebuffer(i.FRAMEBUFFER,null)}function Pt(w,S,F){if(i.bindRenderbuffer(i.RENDERBUFFER,w),S.depthBuffer){const k=S.depthTexture,Y=k&&k.isDepthTexture?k.type:null,V=x(S.stencilBuffer,Y),wt=S.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,st=ie(S);St(S)?o.renderbufferStorageMultisampleEXT(i.RENDERBUFFER,st,V,S.width,S.height):F?i.renderbufferStorageMultisample(i.RENDERBUFFER,st,V,S.width,S.height):i.renderbufferStorage(i.RENDERBUFFER,V,S.width,S.height),i.framebufferRenderbuffer(i.FRAMEBUFFER,wt,i.RENDERBUFFER,w)}else{const k=S.textures;for(let Y=0;Y<k.length;Y++){const V=k[Y],wt=r.convert(V.format,V.colorSpace),st=r.convert(V.type),_t=b(V.internalFormat,wt,st,V.colorSpace),bt=ie(S);F&&St(S)===!1?i.renderbufferStorageMultisample(i.RENDERBUFFER,bt,_t,S.width,S.height):St(S)?o.renderbufferStorageMultisampleEXT(i.RENDERBUFFER,bt,_t,S.width,S.height):i.renderbufferStorage(i.RENDERBUFFER,_t,S.width,S.height)}}i.bindRenderbuffer(i.RENDERBUFFER,null)}function gt(w,S){if(S&&S.isWebGLCubeRenderTarget)throw new Error("Depth Texture with cube render targets is not supported");if(e.bindFramebuffer(i.FRAMEBUFFER,w),!(S.depthTexture&&S.depthTexture.isDepthTexture))throw new Error("renderTarget.depthTexture must be an instance of THREE.DepthTexture");const k=n.get(S.depthTexture);k.__renderTarget=S,(!k.__webglTexture||S.depthTexture.image.width!==S.width||S.depthTexture.image.height!==S.height)&&(S.depthTexture.image.width=S.width,S.depthTexture.image.height=S.height,S.depthTexture.needsUpdate=!0),X(S.depthTexture,0);const Y=k.__webglTexture,V=ie(S);if(S.depthTexture.format===Bs)St(S)?o.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER,i.DEPTH_ATTACHMENT,i.TEXTURE_2D,Y,0,V):i.framebufferTexture2D(i.FRAMEBUFFER,i.DEPTH_ATTACHMENT,i.TEXTURE_2D,Y,0);else if(S.depthTexture.format===Us)St(S)?o.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER,i.DEPTH_STENCIL_ATTACHMENT,i.TEXTURE_2D,Y,0,V):i.framebufferTexture2D(i.FRAMEBUFFER,i.DEPTH_STENCIL_ATTACHMENT,i.TEXTURE_2D,Y,0);else throw new Error("Unknown depthTexture format")}function Vt(w){const S=n.get(w),F=w.isWebGLCubeRenderTarget===!0;if(S.__boundDepthTexture!==w.depthTexture){const k=w.depthTexture;if(S.__depthDisposeCallback&&S.__depthDisposeCallback(),k){const Y=()=>{delete S.__boundDepthTexture,delete S.__depthDisposeCallback,k.removeEventListener("dispose",Y)};k.addEventListener("dispose",Y),S.__depthDisposeCallback=Y}S.__boundDepthTexture=k}if(w.depthTexture&&!S.__autoAllocateDepthBuffer){if(F)throw new Error("target.depthTexture not supported in Cube render targets");const k=w.texture.mipmaps;k&&k.length>0?gt(S.__webglFramebuffer[0],w):gt(S.__webglFramebuffer,w)}else if(F){S.__webglDepthbuffer=[];for(let k=0;k<6;k++)if(e.bindFramebuffer(i.FRAMEBUFFER,S.__webglFramebuffer[k]),S.__webglDepthbuffer[k]===void 0)S.__webglDepthbuffer[k]=i.createRenderbuffer(),Pt(S.__webglDepthbuffer[k],w,!1);else{const Y=w.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,V=S.__webglDepthbuffer[k];i.bindRenderbuffer(i.RENDERBUFFER,V),i.framebufferRenderbuffer(i.FRAMEBUFFER,Y,i.RENDERBUFFER,V)}}else{const k=w.texture.mipmaps;if(k&&k.length>0?e.bindFramebuffer(i.FRAMEBUFFER,S.__webglFramebuffer[0]):e.bindFramebuffer(i.FRAMEBUFFER,S.__webglFramebuffer),S.__webglDepthbuffer===void 0)S.__webglDepthbuffer=i.createRenderbuffer(),Pt(S.__webglDepthbuffer,w,!1);else{const Y=w.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,V=S.__webglDepthbuffer;i.bindRenderbuffer(i.RENDERBUFFER,V),i.framebufferRenderbuffer(i.FRAMEBUFFER,Y,i.RENDERBUFFER,V)}}e.bindFramebuffer(i.FRAMEBUFFER,null)}function we(w,S,F){const k=n.get(w);S!==void 0&&mt(k.__webglFramebuffer,w,w.texture,i.COLOR_ATTACHMENT0,i.TEXTURE_2D,0),F!==void 0&&Vt(w)}function P(w){const S=w.texture,F=n.get(w),k=n.get(S);w.addEventListener("dispose",C);const Y=w.textures,V=w.isWebGLCubeRenderTarget===!0,wt=Y.length>1;if(wt||(k.__webglTexture===void 0&&(k.__webglTexture=i.createTexture()),k.__version=S.version,a.memory.textures++),V){F.__webglFramebuffer=[];for(let st=0;st<6;st++)if(S.mipmaps&&S.mipmaps.length>0){F.__webglFramebuffer[st]=[];for(let _t=0;_t<S.mipmaps.length;_t++)F.__webglFramebuffer[st][_t]=i.createFramebuffer()}else F.__webglFramebuffer[st]=i.createFramebuffer()}else{if(S.mipmaps&&S.mipmaps.length>0){F.__webglFramebuffer=[];for(let st=0;st<S.mipmaps.length;st++)F.__webglFramebuffer[st]=i.createFramebuffer()}else F.__webglFramebuffer=i.createFramebuffer();if(wt)for(let st=0,_t=Y.length;st<_t;st++){const bt=n.get(Y[st]);bt.__webglTexture===void 0&&(bt.__webglTexture=i.createTexture(),a.memory.textures++)}if(w.samples>0&&St(w)===!1){F.__webglMultisampledFramebuffer=i.createFramebuffer(),F.__webglColorRenderbuffer=[],e.bindFramebuffer(i.FRAMEBUFFER,F.__webglMultisampledFramebuffer);for(let st=0;st<Y.length;st++){const _t=Y[st];F.__webglColorRenderbuffer[st]=i.createRenderbuffer(),i.bindRenderbuffer(i.RENDERBUFFER,F.__webglColorRenderbuffer[st]);const bt=r.convert(_t.format,_t.colorSpace),tt=r.convert(_t.type),ot=b(_t.internalFormat,bt,tt,_t.colorSpace,w.isXRRenderTarget===!0),Lt=ie(w);i.renderbufferStorageMultisample(i.RENDERBUFFER,Lt,ot,w.width,w.height),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0+st,i.RENDERBUFFER,F.__webglColorRenderbuffer[st])}i.bindRenderbuffer(i.RENDERBUFFER,null),w.depthBuffer&&(F.__webglDepthRenderbuffer=i.createRenderbuffer(),Pt(F.__webglDepthRenderbuffer,w,!0)),e.bindFramebuffer(i.FRAMEBUFFER,null)}}if(V){e.bindTexture(i.TEXTURE_CUBE_MAP,k.__webglTexture),kt(i.TEXTURE_CUBE_MAP,S);for(let st=0;st<6;st++)if(S.mipmaps&&S.mipmaps.length>0)for(let _t=0;_t<S.mipmaps.length;_t++)mt(F.__webglFramebuffer[st][_t],w,S,i.COLOR_ATTACHMENT0,i.TEXTURE_CUBE_MAP_POSITIVE_X+st,_t);else mt(F.__webglFramebuffer[st],w,S,i.COLOR_ATTACHMENT0,i.TEXTURE_CUBE_MAP_POSITIVE_X+st,0);m(S)&&p(i.TEXTURE_CUBE_MAP),e.unbindTexture()}else if(wt){for(let st=0,_t=Y.length;st<_t;st++){const bt=Y[st],tt=n.get(bt);let ot=i.TEXTURE_2D;(w.isWebGL3DRenderTarget||w.isWebGLArrayRenderTarget)&&(ot=w.isWebGL3DRenderTarget?i.TEXTURE_3D:i.TEXTURE_2D_ARRAY),e.bindTexture(ot,tt.__webglTexture),kt(ot,bt),mt(F.__webglFramebuffer,w,bt,i.COLOR_ATTACHMENT0+st,ot,0),m(bt)&&p(ot)}e.unbindTexture()}else{let st=i.TEXTURE_2D;if((w.isWebGL3DRenderTarget||w.isWebGLArrayRenderTarget)&&(st=w.isWebGL3DRenderTarget?i.TEXTURE_3D:i.TEXTURE_2D_ARRAY),e.bindTexture(st,k.__webglTexture),kt(st,S),S.mipmaps&&S.mipmaps.length>0)for(let _t=0;_t<S.mipmaps.length;_t++)mt(F.__webglFramebuffer[_t],w,S,i.COLOR_ATTACHMENT0,st,_t);else mt(F.__webglFramebuffer,w,S,i.COLOR_ATTACHMENT0,st,0);m(S)&&p(st),e.unbindTexture()}w.depthBuffer&&Vt(w)}function ne(w){const S=w.textures;for(let F=0,k=S.length;F<k;F++){const Y=S[F];if(m(Y)){const V=M(w),wt=n.get(Y).__webglTexture;e.bindTexture(V,wt),p(V),e.unbindTexture()}}}const Bt=[],Tt=[];function vt(w){if(w.samples>0){if(St(w)===!1){const S=w.textures,F=w.width,k=w.height;let Y=i.COLOR_BUFFER_BIT;const V=w.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,wt=n.get(w),st=S.length>1;if(st)for(let bt=0;bt<S.length;bt++)e.bindFramebuffer(i.FRAMEBUFFER,wt.__webglMultisampledFramebuffer),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0+bt,i.RENDERBUFFER,null),e.bindFramebuffer(i.FRAMEBUFFER,wt.__webglFramebuffer),i.framebufferTexture2D(i.DRAW_FRAMEBUFFER,i.COLOR_ATTACHMENT0+bt,i.TEXTURE_2D,null,0);e.bindFramebuffer(i.READ_FRAMEBUFFER,wt.__webglMultisampledFramebuffer);const _t=w.texture.mipmaps;_t&&_t.length>0?e.bindFramebuffer(i.DRAW_FRAMEBUFFER,wt.__webglFramebuffer[0]):e.bindFramebuffer(i.DRAW_FRAMEBUFFER,wt.__webglFramebuffer);for(let bt=0;bt<S.length;bt++){if(w.resolveDepthBuffer&&(w.depthBuffer&&(Y|=i.DEPTH_BUFFER_BIT),w.stencilBuffer&&w.resolveStencilBuffer&&(Y|=i.STENCIL_BUFFER_BIT)),st){i.framebufferRenderbuffer(i.READ_FRAMEBUFFER,i.COLOR_ATTACHMENT0,i.RENDERBUFFER,wt.__webglColorRenderbuffer[bt]);const tt=n.get(S[bt]).__webglTexture;i.framebufferTexture2D(i.DRAW_FRAMEBUFFER,i.COLOR_ATTACHMENT0,i.TEXTURE_2D,tt,0)}i.blitFramebuffer(0,0,F,k,0,0,F,k,Y,i.NEAREST),l===!0&&(Bt.length=0,Tt.length=0,Bt.push(i.COLOR_ATTACHMENT0+bt),w.depthBuffer&&w.resolveDepthBuffer===!1&&(Bt.push(V),Tt.push(V),i.invalidateFramebuffer(i.DRAW_FRAMEBUFFER,Tt)),i.invalidateFramebuffer(i.READ_FRAMEBUFFER,Bt))}if(e.bindFramebuffer(i.READ_FRAMEBUFFER,null),e.bindFramebuffer(i.DRAW_FRAMEBUFFER,null),st)for(let bt=0;bt<S.length;bt++){e.bindFramebuffer(i.FRAMEBUFFER,wt.__webglMultisampledFramebuffer),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0+bt,i.RENDERBUFFER,wt.__webglColorRenderbuffer[bt]);const tt=n.get(S[bt]).__webglTexture;e.bindFramebuffer(i.FRAMEBUFFER,wt.__webglFramebuffer),i.framebufferTexture2D(i.DRAW_FRAMEBUFFER,i.COLOR_ATTACHMENT0+bt,i.TEXTURE_2D,tt,0)}e.bindFramebuffer(i.DRAW_FRAMEBUFFER,wt.__webglMultisampledFramebuffer)}else if(w.depthBuffer&&w.resolveDepthBuffer===!1&&l){const S=w.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT;i.invalidateFramebuffer(i.DRAW_FRAMEBUFFER,[S])}}}function ie(w){return Math.min(s.maxSamples,w.samples)}function St(w){const S=n.get(w);return w.samples>0&&t.has("WEBGL_multisampled_render_to_texture")===!0&&S.__useRenderToTexture!==!1}function Ot(w){const S=a.render.frame;u.get(w)!==S&&(u.set(w,S),w.update())}function xe(w,S){const F=w.colorSpace,k=w.format,Y=w.type;return w.isCompressedTexture===!0||w.isVideoTexture===!0||F!==es&&F!==Gn&&(Kt.getTransfer(F)===ae?(k!==dn||Y!==yn)&&console.warn("THREE.WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType."):console.error("THREE.WebGLTextures: Unsupported texture color space:",F)),S}function at(w){return typeof HTMLImageElement<"u"&&w instanceof HTMLImageElement?(c.width=w.naturalWidth||w.width,c.height=w.naturalHeight||w.height):typeof VideoFrame<"u"&&w instanceof VideoFrame?(c.width=w.displayWidth,c.height=w.displayHeight):(c.width=w.width,c.height=w.height),c}this.allocateTextureUnit=z,this.resetTextureUnits=U,this.setTexture2D=X,this.setTexture2DArray=q,this.setTexture3D=Z,this.setTextureCube=W,this.rebindTextures=we,this.setupRenderTarget=P,this.updateRenderTargetMipmap=ne,this.updateMultisampleRenderTarget=vt,this.setupDepthRenderbuffer=Vt,this.setupFrameBufferTexture=mt,this.useMultisampledRTT=St}function LS(i,t){function e(n,s=Gn){let r;const a=Kt.getTransfer(s);if(n===yn)return i.UNSIGNED_BYTE;if(n===el)return i.UNSIGNED_SHORT_4_4_4_4;if(n===nl)return i.UNSIGNED_SHORT_5_5_5_1;if(n===Ch)return i.UNSIGNED_INT_5_9_9_9_REV;if(n===Ah)return i.UNSIGNED_INT_10F_11F_11F_REV;if(n===Eh)return i.BYTE;if(n===Th)return i.SHORT;if(n===Is)return i.UNSIGNED_SHORT;if(n===tl)return i.INT;if(n===pi)return i.UNSIGNED_INT;if(n===vn)return i.FLOAT;if(n===Gs)return i.HALF_FLOAT;if(n===Lh)return i.ALPHA;if(n===Ph)return i.RGB;if(n===dn)return i.RGBA;if(n===Bs)return i.DEPTH_COMPONENT;if(n===Us)return i.DEPTH_STENCIL;if(n===il)return i.RED;if(n===sl)return i.RED_INTEGER;if(n===Fh)return i.RG;if(n===rl)return i.RG_INTEGER;if(n===al)return i.RGBA_INTEGER;if(n===Dr||n===Br||n===Ur||n===Nr)if(a===ae)if(r=t.get("WEBGL_compressed_texture_s3tc_srgb"),r!==null){if(n===Dr)return r.COMPRESSED_SRGB_S3TC_DXT1_EXT;if(n===Br)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;if(n===Ur)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;if(n===Nr)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT}else return null;else if(r=t.get("WEBGL_compressed_texture_s3tc"),r!==null){if(n===Dr)return r.COMPRESSED_RGB_S3TC_DXT1_EXT;if(n===Br)return r.COMPRESSED_RGBA_S3TC_DXT1_EXT;if(n===Ur)return r.COMPRESSED_RGBA_S3TC_DXT3_EXT;if(n===Nr)return r.COMPRESSED_RGBA_S3TC_DXT5_EXT}else return null;if(n===fo||n===po||n===mo||n===go)if(r=t.get("WEBGL_compressed_texture_pvrtc"),r!==null){if(n===fo)return r.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;if(n===po)return r.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;if(n===mo)return r.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;if(n===go)return r.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG}else return null;if(n===vo||n===So||n===xo)if(r=t.get("WEBGL_compressed_texture_etc"),r!==null){if(n===vo||n===So)return a===ae?r.COMPRESSED_SRGB8_ETC2:r.COMPRESSED_RGB8_ETC2;if(n===xo)return a===ae?r.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC:r.COMPRESSED_RGBA8_ETC2_EAC}else return null;if(n===_o||n===yo||n===Mo||n===bo||n===Ro||n===wo||n===Eo||n===To||n===Co||n===Ao||n===Lo||n===Po||n===Fo||n===Io)if(r=t.get("WEBGL_compressed_texture_astc"),r!==null){if(n===_o)return a===ae?r.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR:r.COMPRESSED_RGBA_ASTC_4x4_KHR;if(n===yo)return a===ae?r.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR:r.COMPRESSED_RGBA_ASTC_5x4_KHR;if(n===Mo)return a===ae?r.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR:r.COMPRESSED_RGBA_ASTC_5x5_KHR;if(n===bo)return a===ae?r.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR:r.COMPRESSED_RGBA_ASTC_6x5_KHR;if(n===Ro)return a===ae?r.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR:r.COMPRESSED_RGBA_ASTC_6x6_KHR;if(n===wo)return a===ae?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR:r.COMPRESSED_RGBA_ASTC_8x5_KHR;if(n===Eo)return a===ae?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR:r.COMPRESSED_RGBA_ASTC_8x6_KHR;if(n===To)return a===ae?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR:r.COMPRESSED_RGBA_ASTC_8x8_KHR;if(n===Co)return a===ae?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR:r.COMPRESSED_RGBA_ASTC_10x5_KHR;if(n===Ao)return a===ae?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR:r.COMPRESSED_RGBA_ASTC_10x6_KHR;if(n===Lo)return a===ae?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR:r.COMPRESSED_RGBA_ASTC_10x8_KHR;if(n===Po)return a===ae?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR:r.COMPRESSED_RGBA_ASTC_10x10_KHR;if(n===Fo)return a===ae?r.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR:r.COMPRESSED_RGBA_ASTC_12x10_KHR;if(n===Io)return a===ae?r.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR:r.COMPRESSED_RGBA_ASTC_12x12_KHR}else return null;if(n===Do||n===Bo||n===Uo)if(r=t.get("EXT_texture_compression_bptc"),r!==null){if(n===Do)return a===ae?r.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT:r.COMPRESSED_RGBA_BPTC_UNORM_EXT;if(n===Bo)return r.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;if(n===Uo)return r.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT}else return null;if(n===No||n===Oo||n===zo||n===ko)if(r=t.get("EXT_texture_compression_rgtc"),r!==null){if(n===No)return r.COMPRESSED_RED_RGTC1_EXT;if(n===Oo)return r.COMPRESSED_SIGNED_RED_RGTC1_EXT;if(n===zo)return r.COMPRESSED_RED_GREEN_RGTC2_EXT;if(n===ko)return r.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT}else return null;return n===Ds?i.UNSIGNED_INT_24_8:i[n]!==void 0?i[n]:null}return{convert:e}}const PS=`
void main() {

	gl_Position = vec4( position, 1.0 );

}`,FS=`
uniform sampler2DArray depthColor;
uniform float depthWidth;
uniform float depthHeight;

void main() {

	vec2 coord = vec2( gl_FragCoord.x / depthWidth, gl_FragCoord.y / depthHeight );

	if ( coord.x >= 1.0 ) {

		gl_FragDepth = texture( depthColor, vec3( coord.x - 1.0, coord.y, 1 ) ).r;

	} else {

		gl_FragDepth = texture( depthColor, vec3( coord.x, coord.y, 0 ) ).r;

	}

}`;class IS{constructor(){this.texture=null,this.mesh=null,this.depthNear=0,this.depthFar=0}init(t,e){if(this.texture===null){const n=new Xh(t.texture);(t.depthNear!==e.depthNear||t.depthFar!==e.depthFar)&&(this.depthNear=t.depthNear,this.depthFar=t.depthFar),this.texture=n}}getMesh(t){if(this.texture!==null&&this.mesh===null){const e=t.cameras[0].viewport,n=new Jn({vertexShader:PS,fragmentShader:FS,uniforms:{depthColor:{value:this.texture},depthWidth:{value:e.z},depthHeight:{value:e.w}}});this.mesh=new Mt(new on(20,20),n)}return this.mesh}reset(){this.texture=null,this.mesh=null}getDepthTexture(){return this.texture}}class DS extends rs{constructor(t,e){super();const n=this;let s=null,r=1,a=null,o="local-floor",l=1,c=null,u=null,h=null,d=null,f=null,g=null;const v=typeof XRWebGLBinding<"u",m=new IS,p={},M=e.getContextAttributes();let b=null,x=null;const E=[],T=[],C=new ft;let A=null;const _=new rn;_.viewport=new me;const y=new rn;y.viewport=new me;const L=[_,y],U=new tm;let z=null,$=null;this.cameraAutoUpdate=!0,this.enabled=!1,this.isPresenting=!1,this.getController=function(K){let j=E[K];return j===void 0&&(j=new Pa,E[K]=j),j.getTargetRaySpace()},this.getControllerGrip=function(K){let j=E[K];return j===void 0&&(j=new Pa,E[K]=j),j.getGripSpace()},this.getHand=function(K){let j=E[K];return j===void 0&&(j=new Pa,E[K]=j),j.getHandSpace()};function X(K){const j=T.indexOf(K.inputSource);if(j===-1)return;const mt=E[j];mt!==void 0&&(mt.update(K.inputSource,K.frame,c||a),mt.dispatchEvent({type:K.type,data:K.inputSource}))}function q(){s.removeEventListener("select",X),s.removeEventListener("selectstart",X),s.removeEventListener("selectend",X),s.removeEventListener("squeeze",X),s.removeEventListener("squeezestart",X),s.removeEventListener("squeezeend",X),s.removeEventListener("end",q),s.removeEventListener("inputsourceschange",Z);for(let K=0;K<E.length;K++){const j=T[K];j!==null&&(T[K]=null,E[K].disconnect(j))}z=null,$=null,m.reset();for(const K in p)delete p[K];t.setRenderTarget(b),f=null,d=null,h=null,s=null,x=null,Yt.stop(),n.isPresenting=!1,t.setPixelRatio(A),t.setSize(C.width,C.height,!1),n.dispatchEvent({type:"sessionend"})}this.setFramebufferScaleFactor=function(K){r=K,n.isPresenting===!0&&console.warn("THREE.WebXRManager: Cannot change framebuffer scale while presenting.")},this.setReferenceSpaceType=function(K){o=K,n.isPresenting===!0&&console.warn("THREE.WebXRManager: Cannot change reference space type while presenting.")},this.getReferenceSpace=function(){return c||a},this.setReferenceSpace=function(K){c=K},this.getBaseLayer=function(){return d!==null?d:f},this.getBinding=function(){return h===null&&v&&(h=new XRWebGLBinding(s,e)),h},this.getFrame=function(){return g},this.getSession=function(){return s},this.setSession=async function(K){if(s=K,s!==null){if(b=t.getRenderTarget(),s.addEventListener("select",X),s.addEventListener("selectstart",X),s.addEventListener("selectend",X),s.addEventListener("squeeze",X),s.addEventListener("squeezestart",X),s.addEventListener("squeezeend",X),s.addEventListener("end",q),s.addEventListener("inputsourceschange",Z),M.xrCompatible!==!0&&await e.makeXRCompatible(),A=t.getPixelRatio(),t.getSize(C),v&&"createProjectionLayer"in XRWebGLBinding.prototype){let mt=null,Pt=null,gt=null;M.depth&&(gt=M.stencil?e.DEPTH24_STENCIL8:e.DEPTH_COMPONENT24,mt=M.stencil?Us:Bs,Pt=M.stencil?Ds:pi);const Vt={colorFormat:e.RGBA8,depthFormat:gt,scaleFactor:r};h=this.getBinding(),d=h.createProjectionLayer(Vt),s.updateRenderState({layers:[d]}),t.setPixelRatio(1),t.setSize(d.textureWidth,d.textureHeight,!1),x=new mi(d.textureWidth,d.textureHeight,{format:dn,type:yn,depthTexture:new $h(d.textureWidth,d.textureHeight,Pt,void 0,void 0,void 0,void 0,void 0,void 0,mt),stencilBuffer:M.stencil,colorSpace:t.outputColorSpace,samples:M.antialias?4:0,resolveDepthBuffer:d.ignoreDepthValues===!1,resolveStencilBuffer:d.ignoreDepthValues===!1})}else{const mt={antialias:M.antialias,alpha:!0,depth:M.depth,stencil:M.stencil,framebufferScaleFactor:r};f=new XRWebGLLayer(s,e,mt),s.updateRenderState({baseLayer:f}),t.setPixelRatio(1),t.setSize(f.framebufferWidth,f.framebufferHeight,!1),x=new mi(f.framebufferWidth,f.framebufferHeight,{format:dn,type:yn,colorSpace:t.outputColorSpace,stencilBuffer:M.stencil,resolveDepthBuffer:f.ignoreDepthValues===!1,resolveStencilBuffer:f.ignoreDepthValues===!1})}x.isXRRenderTarget=!0,this.setFoveation(l),c=null,a=await s.requestReferenceSpace(o),Yt.setContext(s),Yt.start(),n.isPresenting=!0,n.dispatchEvent({type:"sessionstart"})}},this.getEnvironmentBlendMode=function(){if(s!==null)return s.environmentBlendMode},this.getDepthTexture=function(){return m.getDepthTexture()};function Z(K){for(let j=0;j<K.removed.length;j++){const mt=K.removed[j],Pt=T.indexOf(mt);Pt>=0&&(T[Pt]=null,E[Pt].disconnect(mt))}for(let j=0;j<K.added.length;j++){const mt=K.added[j];let Pt=T.indexOf(mt);if(Pt===-1){for(let Vt=0;Vt<E.length;Vt++)if(Vt>=T.length){T.push(mt),Pt=Vt;break}else if(T[Vt]===null){T[Vt]=mt,Pt=Vt;break}if(Pt===-1)break}const gt=E[Pt];gt&&gt.connect(mt)}}const W=new B,rt=new B;function ut(K,j,mt){W.setFromMatrixPosition(j.matrixWorld),rt.setFromMatrixPosition(mt.matrixWorld);const Pt=W.distanceTo(rt),gt=j.projectionMatrix.elements,Vt=mt.projectionMatrix.elements,we=gt[14]/(gt[10]-1),P=gt[14]/(gt[10]+1),ne=(gt[9]+1)/gt[5],Bt=(gt[9]-1)/gt[5],Tt=(gt[8]-1)/gt[0],vt=(Vt[8]+1)/Vt[0],ie=we*Tt,St=we*vt,Ot=Pt/(-Tt+vt),xe=Ot*-Tt;if(j.matrixWorld.decompose(K.position,K.quaternion,K.scale),K.translateX(xe),K.translateZ(Ot),K.matrixWorld.compose(K.position,K.quaternion,K.scale),K.matrixWorldInverse.copy(K.matrixWorld).invert(),gt[10]===-1)K.projectionMatrix.copy(j.projectionMatrix),K.projectionMatrixInverse.copy(j.projectionMatrixInverse);else{const at=we+Ot,w=P+Ot,S=ie-xe,F=St+(Pt-xe),k=ne*P/w*at,Y=Bt*P/w*at;K.projectionMatrix.makePerspective(S,F,k,Y,at,w),K.projectionMatrixInverse.copy(K.projectionMatrix).invert()}}function Et(K,j){j===null?K.matrixWorld.copy(K.matrix):K.matrixWorld.multiplyMatrices(j.matrixWorld,K.matrix),K.matrixWorldInverse.copy(K.matrixWorld).invert()}this.updateCamera=function(K){if(s===null)return;let j=K.near,mt=K.far;m.texture!==null&&(m.depthNear>0&&(j=m.depthNear),m.depthFar>0&&(mt=m.depthFar)),U.near=y.near=_.near=j,U.far=y.far=_.far=mt,(z!==U.near||$!==U.far)&&(s.updateRenderState({depthNear:U.near,depthFar:U.far}),z=U.near,$=U.far),U.layers.mask=K.layers.mask|6,_.layers.mask=U.layers.mask&3,y.layers.mask=U.layers.mask&5;const Pt=K.parent,gt=U.cameras;Et(U,Pt);for(let Vt=0;Vt<gt.length;Vt++)Et(gt[Vt],Pt);gt.length===2?ut(U,_,y):U.projectionMatrix.copy(_.projectionMatrix),kt(K,U,Pt)};function kt(K,j,mt){mt===null?K.matrix.copy(j.matrixWorld):(K.matrix.copy(mt.matrixWorld),K.matrix.invert(),K.matrix.multiply(j.matrixWorld)),K.matrix.decompose(K.position,K.quaternion,K.scale),K.updateMatrixWorld(!0),K.projectionMatrix.copy(j.projectionMatrix),K.projectionMatrixInverse.copy(j.projectionMatrixInverse),K.isPerspectiveCamera&&(K.fov=Go*2*Math.atan(1/K.projectionMatrix.elements[5]),K.zoom=1)}this.getCamera=function(){return U},this.getFoveation=function(){if(!(d===null&&f===null))return l},this.setFoveation=function(K){l=K,d!==null&&(d.fixedFoveation=K),f!==null&&f.fixedFoveation!==void 0&&(f.fixedFoveation=K)},this.hasDepthSensing=function(){return m.texture!==null},this.getDepthSensingMesh=function(){return m.getMesh(U)},this.getCameraTexture=function(K){return p[K]};let Zt=null;function ee(K,j){if(u=j.getViewerPose(c||a),g=j,u!==null){const mt=u.views;f!==null&&(t.setRenderTargetFramebuffer(x,f.framebuffer),t.setRenderTarget(x));let Pt=!1;mt.length!==U.cameras.length&&(U.cameras.length=0,Pt=!0);for(let P=0;P<mt.length;P++){const ne=mt[P];let Bt=null;if(f!==null)Bt=f.getViewport(ne);else{const vt=h.getViewSubImage(d,ne);Bt=vt.viewport,P===0&&(t.setRenderTargetTextures(x,vt.colorTexture,vt.depthStencilTexture),t.setRenderTarget(x))}let Tt=L[P];Tt===void 0&&(Tt=new rn,Tt.layers.enable(P),Tt.viewport=new me,L[P]=Tt),Tt.matrix.fromArray(ne.transform.matrix),Tt.matrix.decompose(Tt.position,Tt.quaternion,Tt.scale),Tt.projectionMatrix.fromArray(ne.projectionMatrix),Tt.projectionMatrixInverse.copy(Tt.projectionMatrix).invert(),Tt.viewport.set(Bt.x,Bt.y,Bt.width,Bt.height),P===0&&(U.matrix.copy(Tt.matrix),U.matrix.decompose(U.position,U.quaternion,U.scale)),Pt===!0&&U.cameras.push(Tt)}const gt=s.enabledFeatures;if(gt&&gt.includes("depth-sensing")&&s.depthUsage=="gpu-optimized"&&v){h=n.getBinding();const P=h.getDepthInformation(mt[0]);P&&P.isValid&&P.texture&&m.init(P,s.renderState)}if(gt&&gt.includes("camera-access")&&v){t.state.unbindTexture(),h=n.getBinding();for(let P=0;P<mt.length;P++){const ne=mt[P].camera;if(ne){let Bt=p[ne];Bt||(Bt=new Xh,p[ne]=Bt);const Tt=h.getCameraImage(ne);Bt.sourceTexture=Tt}}}}for(let mt=0;mt<E.length;mt++){const Pt=T[mt],gt=E[mt];Pt!==null&&gt!==void 0&&gt.update(Pt,j,c||a)}Zt&&Zt(K,j),j.detectedPlanes&&n.dispatchEvent({type:"planesdetected",data:j}),g=null}const Yt=new iu;Yt.setAnimationLoop(ee),this.setAnimationLoop=function(K){Zt=K},this.dispose=function(){}}}const si=new Mn,BS=new se;function US(i,t){function e(m,p){m.matrixAutoUpdate===!0&&m.updateMatrix(),p.value.copy(m.matrix)}function n(m,p){p.color.getRGB(m.fogColor.value,kh(i)),p.isFog?(m.fogNear.value=p.near,m.fogFar.value=p.far):p.isFogExp2&&(m.fogDensity.value=p.density)}function s(m,p,M,b,x){p.isMeshBasicMaterial||p.isMeshLambertMaterial?r(m,p):p.isMeshToonMaterial?(r(m,p),h(m,p)):p.isMeshPhongMaterial?(r(m,p),u(m,p)):p.isMeshStandardMaterial?(r(m,p),d(m,p),p.isMeshPhysicalMaterial&&f(m,p,x)):p.isMeshMatcapMaterial?(r(m,p),g(m,p)):p.isMeshDepthMaterial?r(m,p):p.isMeshDistanceMaterial?(r(m,p),v(m,p)):p.isMeshNormalMaterial?r(m,p):p.isLineBasicMaterial?(a(m,p),p.isLineDashedMaterial&&o(m,p)):p.isPointsMaterial?l(m,p,M,b):p.isSpriteMaterial?c(m,p):p.isShadowMaterial?(m.color.value.copy(p.color),m.opacity.value=p.opacity):p.isShaderMaterial&&(p.uniformsNeedUpdate=!1)}function r(m,p){m.opacity.value=p.opacity,p.color&&m.diffuse.value.copy(p.color),p.emissive&&m.emissive.value.copy(p.emissive).multiplyScalar(p.emissiveIntensity),p.map&&(m.map.value=p.map,e(p.map,m.mapTransform)),p.alphaMap&&(m.alphaMap.value=p.alphaMap,e(p.alphaMap,m.alphaMapTransform)),p.bumpMap&&(m.bumpMap.value=p.bumpMap,e(p.bumpMap,m.bumpMapTransform),m.bumpScale.value=p.bumpScale,p.side===Ie&&(m.bumpScale.value*=-1)),p.normalMap&&(m.normalMap.value=p.normalMap,e(p.normalMap,m.normalMapTransform),m.normalScale.value.copy(p.normalScale),p.side===Ie&&m.normalScale.value.negate()),p.displacementMap&&(m.displacementMap.value=p.displacementMap,e(p.displacementMap,m.displacementMapTransform),m.displacementScale.value=p.displacementScale,m.displacementBias.value=p.displacementBias),p.emissiveMap&&(m.emissiveMap.value=p.emissiveMap,e(p.emissiveMap,m.emissiveMapTransform)),p.specularMap&&(m.specularMap.value=p.specularMap,e(p.specularMap,m.specularMapTransform)),p.alphaTest>0&&(m.alphaTest.value=p.alphaTest);const M=t.get(p),b=M.envMap,x=M.envMapRotation;b&&(m.envMap.value=b,si.copy(x),si.x*=-1,si.y*=-1,si.z*=-1,b.isCubeTexture&&b.isRenderTargetTexture===!1&&(si.y*=-1,si.z*=-1),m.envMapRotation.value.setFromMatrix4(BS.makeRotationFromEuler(si)),m.flipEnvMap.value=b.isCubeTexture&&b.isRenderTargetTexture===!1?-1:1,m.reflectivity.value=p.reflectivity,m.ior.value=p.ior,m.refractionRatio.value=p.refractionRatio),p.lightMap&&(m.lightMap.value=p.lightMap,m.lightMapIntensity.value=p.lightMapIntensity,e(p.lightMap,m.lightMapTransform)),p.aoMap&&(m.aoMap.value=p.aoMap,m.aoMapIntensity.value=p.aoMapIntensity,e(p.aoMap,m.aoMapTransform))}function a(m,p){m.diffuse.value.copy(p.color),m.opacity.value=p.opacity,p.map&&(m.map.value=p.map,e(p.map,m.mapTransform))}function o(m,p){m.dashSize.value=p.dashSize,m.totalSize.value=p.dashSize+p.gapSize,m.scale.value=p.scale}function l(m,p,M,b){m.diffuse.value.copy(p.color),m.opacity.value=p.opacity,m.size.value=p.size*M,m.scale.value=b*.5,p.map&&(m.map.value=p.map,e(p.map,m.uvTransform)),p.alphaMap&&(m.alphaMap.value=p.alphaMap,e(p.alphaMap,m.alphaMapTransform)),p.alphaTest>0&&(m.alphaTest.value=p.alphaTest)}function c(m,p){m.diffuse.value.copy(p.color),m.opacity.value=p.opacity,m.rotation.value=p.rotation,p.map&&(m.map.value=p.map,e(p.map,m.mapTransform)),p.alphaMap&&(m.alphaMap.value=p.alphaMap,e(p.alphaMap,m.alphaMapTransform)),p.alphaTest>0&&(m.alphaTest.value=p.alphaTest)}function u(m,p){m.specular.value.copy(p.specular),m.shininess.value=Math.max(p.shininess,1e-4)}function h(m,p){p.gradientMap&&(m.gradientMap.value=p.gradientMap)}function d(m,p){m.metalness.value=p.metalness,p.metalnessMap&&(m.metalnessMap.value=p.metalnessMap,e(p.metalnessMap,m.metalnessMapTransform)),m.roughness.value=p.roughness,p.roughnessMap&&(m.roughnessMap.value=p.roughnessMap,e(p.roughnessMap,m.roughnessMapTransform)),p.envMap&&(m.envMapIntensity.value=p.envMapIntensity)}function f(m,p,M){m.ior.value=p.ior,p.sheen>0&&(m.sheenColor.value.copy(p.sheenColor).multiplyScalar(p.sheen),m.sheenRoughness.value=p.sheenRoughness,p.sheenColorMap&&(m.sheenColorMap.value=p.sheenColorMap,e(p.sheenColorMap,m.sheenColorMapTransform)),p.sheenRoughnessMap&&(m.sheenRoughnessMap.value=p.sheenRoughnessMap,e(p.sheenRoughnessMap,m.sheenRoughnessMapTransform))),p.clearcoat>0&&(m.clearcoat.value=p.clearcoat,m.clearcoatRoughness.value=p.clearcoatRoughness,p.clearcoatMap&&(m.clearcoatMap.value=p.clearcoatMap,e(p.clearcoatMap,m.clearcoatMapTransform)),p.clearcoatRoughnessMap&&(m.clearcoatRoughnessMap.value=p.clearcoatRoughnessMap,e(p.clearcoatRoughnessMap,m.clearcoatRoughnessMapTransform)),p.clearcoatNormalMap&&(m.clearcoatNormalMap.value=p.clearcoatNormalMap,e(p.clearcoatNormalMap,m.clearcoatNormalMapTransform),m.clearcoatNormalScale.value.copy(p.clearcoatNormalScale),p.side===Ie&&m.clearcoatNormalScale.value.negate())),p.dispersion>0&&(m.dispersion.value=p.dispersion),p.iridescence>0&&(m.iridescence.value=p.iridescence,m.iridescenceIOR.value=p.iridescenceIOR,m.iridescenceThicknessMinimum.value=p.iridescenceThicknessRange[0],m.iridescenceThicknessMaximum.value=p.iridescenceThicknessRange[1],p.iridescenceMap&&(m.iridescenceMap.value=p.iridescenceMap,e(p.iridescenceMap,m.iridescenceMapTransform)),p.iridescenceThicknessMap&&(m.iridescenceThicknessMap.value=p.iridescenceThicknessMap,e(p.iridescenceThicknessMap,m.iridescenceThicknessMapTransform))),p.transmission>0&&(m.transmission.value=p.transmission,m.transmissionSamplerMap.value=M.texture,m.transmissionSamplerSize.value.set(M.width,M.height),p.transmissionMap&&(m.transmissionMap.value=p.transmissionMap,e(p.transmissionMap,m.transmissionMapTransform)),m.thickness.value=p.thickness,p.thicknessMap&&(m.thicknessMap.value=p.thicknessMap,e(p.thicknessMap,m.thicknessMapTransform)),m.attenuationDistance.value=p.attenuationDistance,m.attenuationColor.value.copy(p.attenuationColor)),p.anisotropy>0&&(m.anisotropyVector.value.set(p.anisotropy*Math.cos(p.anisotropyRotation),p.anisotropy*Math.sin(p.anisotropyRotation)),p.anisotropyMap&&(m.anisotropyMap.value=p.anisotropyMap,e(p.anisotropyMap,m.anisotropyMapTransform))),m.specularIntensity.value=p.specularIntensity,m.specularColor.value.copy(p.specularColor),p.specularColorMap&&(m.specularColorMap.value=p.specularColorMap,e(p.specularColorMap,m.specularColorMapTransform)),p.specularIntensityMap&&(m.specularIntensityMap.value=p.specularIntensityMap,e(p.specularIntensityMap,m.specularIntensityMapTransform))}function g(m,p){p.matcap&&(m.matcap.value=p.matcap)}function v(m,p){const M=t.get(p).light;m.referencePosition.value.setFromMatrixPosition(M.matrixWorld),m.nearDistance.value=M.shadow.camera.near,m.farDistance.value=M.shadow.camera.far}return{refreshFogUniforms:n,refreshMaterialUniforms:s}}function NS(i,t,e,n){let s={},r={},a=[];const o=i.getParameter(i.MAX_UNIFORM_BUFFER_BINDINGS);function l(M,b){const x=b.program;n.uniformBlockBinding(M,x)}function c(M,b){let x=s[M.id];x===void 0&&(g(M),x=u(M),s[M.id]=x,M.addEventListener("dispose",m));const E=b.program;n.updateUBOMapping(M,E);const T=t.render.frame;r[M.id]!==T&&(d(M),r[M.id]=T)}function u(M){const b=h();M.__bindingPointIndex=b;const x=i.createBuffer(),E=M.__size,T=M.usage;return i.bindBuffer(i.UNIFORM_BUFFER,x),i.bufferData(i.UNIFORM_BUFFER,E,T),i.bindBuffer(i.UNIFORM_BUFFER,null),i.bindBufferBase(i.UNIFORM_BUFFER,b,x),x}function h(){for(let M=0;M<o;M++)if(a.indexOf(M)===-1)return a.push(M),M;return console.error("THREE.WebGLRenderer: Maximum number of simultaneously usable uniforms groups reached."),0}function d(M){const b=s[M.id],x=M.uniforms,E=M.__cache;i.bindBuffer(i.UNIFORM_BUFFER,b);for(let T=0,C=x.length;T<C;T++){const A=Array.isArray(x[T])?x[T]:[x[T]];for(let _=0,y=A.length;_<y;_++){const L=A[_];if(f(L,T,_,E)===!0){const U=L.__offset,z=Array.isArray(L.value)?L.value:[L.value];let $=0;for(let X=0;X<z.length;X++){const q=z[X],Z=v(q);typeof q=="number"||typeof q=="boolean"?(L.__data[0]=q,i.bufferSubData(i.UNIFORM_BUFFER,U+$,L.__data)):q.isMatrix3?(L.__data[0]=q.elements[0],L.__data[1]=q.elements[1],L.__data[2]=q.elements[2],L.__data[3]=0,L.__data[4]=q.elements[3],L.__data[5]=q.elements[4],L.__data[6]=q.elements[5],L.__data[7]=0,L.__data[8]=q.elements[6],L.__data[9]=q.elements[7],L.__data[10]=q.elements[8],L.__data[11]=0):(q.toArray(L.__data,$),$+=Z.storage/Float32Array.BYTES_PER_ELEMENT)}i.bufferSubData(i.UNIFORM_BUFFER,U,L.__data)}}}i.bindBuffer(i.UNIFORM_BUFFER,null)}function f(M,b,x,E){const T=M.value,C=b+"_"+x;if(E[C]===void 0)return typeof T=="number"||typeof T=="boolean"?E[C]=T:E[C]=T.clone(),!0;{const A=E[C];if(typeof T=="number"||typeof T=="boolean"){if(A!==T)return E[C]=T,!0}else if(A.equals(T)===!1)return A.copy(T),!0}return!1}function g(M){const b=M.uniforms;let x=0;const E=16;for(let C=0,A=b.length;C<A;C++){const _=Array.isArray(b[C])?b[C]:[b[C]];for(let y=0,L=_.length;y<L;y++){const U=_[y],z=Array.isArray(U.value)?U.value:[U.value];for(let $=0,X=z.length;$<X;$++){const q=z[$],Z=v(q),W=x%E,rt=W%Z.boundary,ut=W+rt;x+=rt,ut!==0&&E-ut<Z.storage&&(x+=E-ut),U.__data=new Float32Array(Z.storage/Float32Array.BYTES_PER_ELEMENT),U.__offset=x,x+=Z.storage}}}const T=x%E;return T>0&&(x+=E-T),M.__size=x,M.__cache={},this}function v(M){const b={boundary:0,storage:0};return typeof M=="number"||typeof M=="boolean"?(b.boundary=4,b.storage=4):M.isVector2?(b.boundary=8,b.storage=8):M.isVector3||M.isColor?(b.boundary=16,b.storage=12):M.isVector4?(b.boundary=16,b.storage=16):M.isMatrix3?(b.boundary=48,b.storage=48):M.isMatrix4?(b.boundary=64,b.storage=64):M.isTexture?console.warn("THREE.WebGLRenderer: Texture samplers can not be part of an uniforms group."):console.warn("THREE.WebGLRenderer: Unsupported uniform value type.",M),b}function m(M){const b=M.target;b.removeEventListener("dispose",m);const x=a.indexOf(b.__bindingPointIndex);a.splice(x,1),i.deleteBuffer(s[b.id]),delete s[b.id],delete r[b.id]}function p(){for(const M in s)i.deleteBuffer(s[M]);a=[],s={},r={}}return{bind:l,update:c,dispose:p}}class OS{constructor(t={}){const{canvas:e=Bf(),context:n=null,depth:s=!0,stencil:r=!1,alpha:a=!1,antialias:o=!1,premultipliedAlpha:l=!0,preserveDrawingBuffer:c=!1,powerPreference:u="default",failIfMajorPerformanceCaveat:h=!1,reversedDepthBuffer:d=!1}=t;this.isWebGLRenderer=!0;let f;if(n!==null){if(typeof WebGLRenderingContext<"u"&&n instanceof WebGLRenderingContext)throw new Error("THREE.WebGLRenderer: WebGL 1 is not supported since r163.");f=n.getContextAttributes().alpha}else f=a;const g=new Uint32Array(4),v=new Int32Array(4);let m=null,p=null;const M=[],b=[];this.domElement=e,this.debug={checkShaderErrors:!0,onShaderError:null},this.autoClear=!0,this.autoClearColor=!0,this.autoClearDepth=!0,this.autoClearStencil=!0,this.sortObjects=!0,this.clippingPlanes=[],this.localClippingEnabled=!1,this.toneMapping=Xn,this.toneMappingExposure=1,this.transmissionResolutionScale=1;const x=this;let E=!1;this._outputColorSpace=Me;let T=0,C=0,A=null,_=-1,y=null;const L=new me,U=new me;let z=null;const $=new Nt(0);let X=0,q=e.width,Z=e.height,W=1,rt=null,ut=null;const Et=new me(0,0,q,Z),kt=new me(0,0,q,Z);let Zt=!1;const ee=new hl;let Yt=!1,K=!1;const j=new se,mt=new B,Pt=new me,gt={background:null,fog:null,environment:null,overrideMaterial:null,isScene:!0};let Vt=!1;function we(){return A===null?W:1}let P=n;function ne(R,N){return e.getContext(R,N)}try{const R={alpha:!0,depth:s,stencil:r,antialias:o,premultipliedAlpha:l,preserveDrawingBuffer:c,powerPreference:u,failIfMajorPerformanceCaveat:h};if("setAttribute"in e&&e.setAttribute("data-engine",`three.js r${Qo}`),e.addEventListener("webglcontextlost",it,!1),e.addEventListener("webglcontextrestored",dt,!1),e.addEventListener("webglcontextcreationerror",Q,!1),P===null){const N="webgl2";if(P=ne(N,R),P===null)throw ne(N)?new Error("Error creating WebGL context with your selected attributes."):new Error("Error creating WebGL context.")}}catch(R){throw console.error("THREE.WebGLRenderer: "+R.message),R}let Bt,Tt,vt,ie,St,Ot,xe,at,w,S,F,k,Y,V,wt,st,_t,bt,tt,ot,Lt,Rt,lt,Ut;function D(){Bt=new Yg(P),Bt.init(),Rt=new LS(P,Bt),Tt=new Hg(P,Bt,t,Rt),vt=new CS(P,Bt),Tt.reversedDepthBuffer&&d&&vt.buffers.depth.setReversed(!0),ie=new Zg(P),St=new mS,Ot=new AS(P,Bt,vt,St,Tt,Rt,ie),xe=new Vg(x),at=new qg(x),w=new im(P),lt=new zg(P,w),S=new Jg(P,w,ie,lt),F=new Qg(P,S,w,ie),tt=new jg(P,Tt,Ot),st=new Gg(St),k=new pS(x,xe,at,Bt,Tt,lt,st),Y=new US(x,St),V=new vS,wt=new bS(Bt),bt=new Og(x,xe,at,vt,F,f,l),_t=new ES(x,F,Tt),Ut=new NS(P,ie,Tt,vt),ot=new kg(P,Bt,ie),Lt=new Kg(P,Bt,ie),ie.programs=k.programs,x.capabilities=Tt,x.extensions=Bt,x.properties=St,x.renderLists=V,x.shadowMap=_t,x.state=vt,x.info=ie}D();const et=new DS(x,P);this.xr=et,this.getContext=function(){return P},this.getContextAttributes=function(){return P.getContextAttributes()},this.forceContextLoss=function(){const R=Bt.get("WEBGL_lose_context");R&&R.loseContext()},this.forceContextRestore=function(){const R=Bt.get("WEBGL_lose_context");R&&R.restoreContext()},this.getPixelRatio=function(){return W},this.setPixelRatio=function(R){R!==void 0&&(W=R,this.setSize(q,Z,!1))},this.getSize=function(R){return R.set(q,Z)},this.setSize=function(R,N,H=!0){if(et.isPresenting){console.warn("THREE.WebGLRenderer: Can't change size while VR device is presenting.");return}q=R,Z=N,e.width=Math.floor(R*W),e.height=Math.floor(N*W),H===!0&&(e.style.width=R+"px",e.style.height=N+"px"),this.setViewport(0,0,R,N)},this.getDrawingBufferSize=function(R){return R.set(q*W,Z*W).floor()},this.setDrawingBufferSize=function(R,N,H){q=R,Z=N,W=H,e.width=Math.floor(R*H),e.height=Math.floor(N*H),this.setViewport(0,0,R,N)},this.getCurrentViewport=function(R){return R.copy(L)},this.getViewport=function(R){return R.copy(Et)},this.setViewport=function(R,N,H,G){R.isVector4?Et.set(R.x,R.y,R.z,R.w):Et.set(R,N,H,G),vt.viewport(L.copy(Et).multiplyScalar(W).round())},this.getScissor=function(R){return R.copy(kt)},this.setScissor=function(R,N,H,G){R.isVector4?kt.set(R.x,R.y,R.z,R.w):kt.set(R,N,H,G),vt.scissor(U.copy(kt).multiplyScalar(W).round())},this.getScissorTest=function(){return Zt},this.setScissorTest=function(R){vt.setScissorTest(Zt=R)},this.setOpaqueSort=function(R){rt=R},this.setTransparentSort=function(R){ut=R},this.getClearColor=function(R){return R.copy(bt.getClearColor())},this.setClearColor=function(){bt.setClearColor(...arguments)},this.getClearAlpha=function(){return bt.getClearAlpha()},this.setClearAlpha=function(){bt.setClearAlpha(...arguments)},this.clear=function(R=!0,N=!0,H=!0){let G=0;if(R){let O=!1;if(A!==null){const nt=A.texture.format;O=nt===al||nt===rl||nt===sl}if(O){const nt=A.texture.type,ht=nt===yn||nt===pi||nt===Is||nt===Ds||nt===el||nt===nl,yt=bt.getClearColor(),pt=bt.getClearAlpha(),Ft=yt.r,Dt=yt.g,Ct=yt.b;ht?(g[0]=Ft,g[1]=Dt,g[2]=Ct,g[3]=pt,P.clearBufferuiv(P.COLOR,0,g)):(v[0]=Ft,v[1]=Dt,v[2]=Ct,v[3]=pt,P.clearBufferiv(P.COLOR,0,v))}else G|=P.COLOR_BUFFER_BIT}N&&(G|=P.DEPTH_BUFFER_BIT),H&&(G|=P.STENCIL_BUFFER_BIT,this.state.buffers.stencil.setMask(4294967295)),P.clear(G)},this.clearColor=function(){this.clear(!0,!1,!1)},this.clearDepth=function(){this.clear(!1,!0,!1)},this.clearStencil=function(){this.clear(!1,!1,!0)},this.dispose=function(){e.removeEventListener("webglcontextlost",it,!1),e.removeEventListener("webglcontextrestored",dt,!1),e.removeEventListener("webglcontextcreationerror",Q,!1),bt.dispose(),V.dispose(),wt.dispose(),St.dispose(),xe.dispose(),at.dispose(),F.dispose(),lt.dispose(),Ut.dispose(),k.dispose(),et.dispose(),et.removeEventListener("sessionstart",fn),et.removeEventListener("sessionend",gl),Zn.stop()};function it(R){R.preventDefault(),console.log("THREE.WebGLRenderer: Context Lost."),E=!0}function dt(){console.log("THREE.WebGLRenderer: Context Restored."),E=!1;const R=ie.autoReset,N=_t.enabled,H=_t.autoUpdate,G=_t.needsUpdate,O=_t.type;D(),ie.autoReset=R,_t.enabled=N,_t.autoUpdate=H,_t.needsUpdate=G,_t.type=O}function Q(R){console.error("THREE.WebGLRenderer: A WebGL context could not be created. Reason: ",R.statusMessage)}function J(R){const N=R.target;N.removeEventListener("dispose",J),xt(N)}function xt(R){It(R),St.remove(R)}function It(R){const N=St.get(R).programs;N!==void 0&&(N.forEach(function(H){k.releaseProgram(H)}),R.isShaderMaterial&&k.releaseShaderCache(R))}this.renderBufferDirect=function(R,N,H,G,O,nt){N===null&&(N=gt);const ht=O.isMesh&&O.matrixWorld.determinant()<0,yt=cu(R,N,H,G,O);vt.setMaterial(G,ht);let pt=H.index,Ft=1;if(G.wireframe===!0){if(pt=S.getWireframeAttribute(H),pt===void 0)return;Ft=2}const Dt=H.drawRange,Ct=H.attributes.position;let $t=Dt.start*Ft,re=(Dt.start+Dt.count)*Ft;nt!==null&&($t=Math.max($t,nt.start*Ft),re=Math.min(re,(nt.start+nt.count)*Ft)),pt!==null?($t=Math.max($t,0),re=Math.min(re,pt.count)):Ct!=null&&($t=Math.max($t,0),re=Math.min(re,Ct.count));const pe=re-$t;if(pe<0||pe===1/0)return;lt.setup(O,G,yt,H,pt);let ce,le=ot;if(pt!==null&&(ce=w.get(pt),le=Lt,le.setIndex(ce)),O.isMesh)G.wireframe===!0?(vt.setLineWidth(G.wireframeLinewidth*we()),le.setMode(P.LINES)):le.setMode(P.TRIANGLES);else if(O.isLine){let At=G.linewidth;At===void 0&&(At=1),vt.setLineWidth(At*we()),O.isLineSegments?le.setMode(P.LINES):O.isLineLoop?le.setMode(P.LINE_LOOP):le.setMode(P.LINE_STRIP)}else O.isPoints?le.setMode(P.POINTS):O.isSprite&&le.setMode(P.TRIANGLES);if(O.isBatchedMesh)if(O._multiDrawInstances!==null)Ns("THREE.WebGLRenderer: renderMultiDrawInstances has been deprecated and will be removed in r184. Append to renderMultiDraw arguments and use indirection."),le.renderMultiDrawInstances(O._multiDrawStarts,O._multiDrawCounts,O._multiDrawCount,O._multiDrawInstances);else if(Bt.get("WEBGL_multi_draw"))le.renderMultiDraw(O._multiDrawStarts,O._multiDrawCounts,O._multiDrawCount);else{const At=O._multiDrawStarts,he=O._multiDrawCounts,Jt=O._multiDrawCount,$e=pt?w.get(pt).bytesPerElement:1,_i=St.get(G).currentProgram.getUniforms();for(let Xe=0;Xe<Jt;Xe++)_i.setValue(P,"_gl_DrawID",Xe),le.render(At[Xe]/$e,he[Xe])}else if(O.isInstancedMesh)le.renderInstances($t,pe,O.count);else if(H.isInstancedBufferGeometry){const At=H._maxInstanceCount!==void 0?H._maxInstanceCount:1/0,he=Math.min(H.instanceCount,At);le.renderInstances($t,pe,he)}else le.render($t,pe)};function jt(R,N,H){R.transparent===!0&&R.side===Pe&&R.forceSinglePass===!1?(R.side=Ie,R.needsUpdate=!0,$s(R,N,H),R.side=Yn,R.needsUpdate=!0,$s(R,N,H),R.side=Pe):$s(R,N,H)}this.compile=function(R,N,H=null){H===null&&(H=R),p=wt.get(H),p.init(N),b.push(p),H.traverseVisible(function(O){O.isLight&&O.layers.test(N.layers)&&(p.pushLight(O),O.castShadow&&p.pushShadow(O))}),R!==H&&R.traverseVisible(function(O){O.isLight&&O.layers.test(N.layers)&&(p.pushLight(O),O.castShadow&&p.pushShadow(O))}),p.setupLights();const G=new Set;return R.traverse(function(O){if(!(O.isMesh||O.isPoints||O.isLine||O.isSprite))return;const nt=O.material;if(nt)if(Array.isArray(nt))for(let ht=0;ht<nt.length;ht++){const yt=nt[ht];jt(yt,H,O),G.add(yt)}else jt(nt,H,O),G.add(nt)}),p=b.pop(),G},this.compileAsync=function(R,N,H=null){const G=this.compile(R,N,H);return new Promise(O=>{function nt(){if(G.forEach(function(ht){St.get(ht).currentProgram.isReady()&&G.delete(ht)}),G.size===0){O(R);return}setTimeout(nt,10)}Bt.get("KHR_parallel_shader_compile")!==null?nt():setTimeout(nt,10)})};let Qt=null;function Rn(R){Qt&&Qt(R)}function fn(){Zn.stop()}function gl(){Zn.start()}const Zn=new iu;Zn.setAnimationLoop(Rn),typeof self<"u"&&Zn.setContext(self),this.setAnimationLoop=function(R){Qt=R,et.setAnimationLoop(R),R===null?Zn.stop():Zn.start()},et.addEventListener("sessionstart",fn),et.addEventListener("sessionend",gl),this.render=function(R,N){if(N!==void 0&&N.isCamera!==!0){console.error("THREE.WebGLRenderer.render: camera is not an instance of THREE.Camera.");return}if(E===!0)return;if(R.matrixWorldAutoUpdate===!0&&R.updateMatrixWorld(),N.parent===null&&N.matrixWorldAutoUpdate===!0&&N.updateMatrixWorld(),et.enabled===!0&&et.isPresenting===!0&&(et.cameraAutoUpdate===!0&&et.updateCamera(N),N=et.getCamera()),R.isScene===!0&&R.onBeforeRender(x,R,N,A),p=wt.get(R,b.length),p.init(N),b.push(p),j.multiplyMatrices(N.projectionMatrix,N.matrixWorldInverse),ee.setFromProjectionMatrix(j,Sn,N.reversedDepth),K=this.localClippingEnabled,Yt=st.init(this.clippingPlanes,K),m=V.get(R,M.length),m.init(),M.push(m),et.enabled===!0&&et.isPresenting===!0){const nt=x.xr.getDepthSensingMesh();nt!==null&&na(nt,N,-1/0,x.sortObjects)}na(R,N,0,x.sortObjects),m.finish(),x.sortObjects===!0&&m.sort(rt,ut),Vt=et.enabled===!1||et.isPresenting===!1||et.hasDepthSensing()===!1,Vt&&bt.addToRenderList(m,R),this.info.render.frame++,Yt===!0&&st.beginShadows();const H=p.state.shadowsArray;_t.render(H,R,N),Yt===!0&&st.endShadows(),this.info.autoReset===!0&&this.info.reset();const G=m.opaque,O=m.transmissive;if(p.setupLights(),N.isArrayCamera){const nt=N.cameras;if(O.length>0)for(let ht=0,yt=nt.length;ht<yt;ht++){const pt=nt[ht];Sl(G,O,R,pt)}Vt&&bt.render(R);for(let ht=0,yt=nt.length;ht<yt;ht++){const pt=nt[ht];vl(m,R,pt,pt.viewport)}}else O.length>0&&Sl(G,O,R,N),Vt&&bt.render(R),vl(m,R,N);A!==null&&C===0&&(Ot.updateMultisampleRenderTarget(A),Ot.updateRenderTargetMipmap(A)),R.isScene===!0&&R.onAfterRender(x,R,N),lt.resetDefaultState(),_=-1,y=null,b.pop(),b.length>0?(p=b[b.length-1],Yt===!0&&st.setGlobalState(x.clippingPlanes,p.state.camera)):p=null,M.pop(),M.length>0?m=M[M.length-1]:m=null};function na(R,N,H,G){if(R.visible===!1)return;if(R.layers.test(N.layers)){if(R.isGroup)H=R.renderOrder;else if(R.isLOD)R.autoUpdate===!0&&R.update(N);else if(R.isLight)p.pushLight(R),R.castShadow&&p.pushShadow(R);else if(R.isSprite){if(!R.frustumCulled||ee.intersectsSprite(R)){G&&Pt.setFromMatrixPosition(R.matrixWorld).applyMatrix4(j);const ht=F.update(R),yt=R.material;yt.visible&&m.push(R,ht,yt,H,Pt.z,null)}}else if((R.isMesh||R.isLine||R.isPoints)&&(!R.frustumCulled||ee.intersectsObject(R))){const ht=F.update(R),yt=R.material;if(G&&(R.boundingSphere!==void 0?(R.boundingSphere===null&&R.computeBoundingSphere(),Pt.copy(R.boundingSphere.center)):(ht.boundingSphere===null&&ht.computeBoundingSphere(),Pt.copy(ht.boundingSphere.center)),Pt.applyMatrix4(R.matrixWorld).applyMatrix4(j)),Array.isArray(yt)){const pt=ht.groups;for(let Ft=0,Dt=pt.length;Ft<Dt;Ft++){const Ct=pt[Ft],$t=yt[Ct.materialIndex];$t&&$t.visible&&m.push(R,ht,$t,H,Pt.z,Ct)}}else yt.visible&&m.push(R,ht,yt,H,Pt.z,null)}}const nt=R.children;for(let ht=0,yt=nt.length;ht<yt;ht++)na(nt[ht],N,H,G)}function vl(R,N,H,G){const O=R.opaque,nt=R.transmissive,ht=R.transparent;p.setupLightsView(H),Yt===!0&&st.setGlobalState(x.clippingPlanes,H),G&&vt.viewport(L.copy(G)),O.length>0&&Ws(O,N,H),nt.length>0&&Ws(nt,N,H),ht.length>0&&Ws(ht,N,H),vt.buffers.depth.setTest(!0),vt.buffers.depth.setMask(!0),vt.buffers.color.setMask(!0),vt.setPolygonOffset(!1)}function Sl(R,N,H,G){if((H.isScene===!0?H.overrideMaterial:null)!==null)return;p.state.transmissionRenderTarget[G.id]===void 0&&(p.state.transmissionRenderTarget[G.id]=new mi(1,1,{generateMipmaps:!0,type:Bt.has("EXT_color_buffer_half_float")||Bt.has("EXT_color_buffer_float")?Gs:yn,minFilter:di,samples:4,stencilBuffer:r,resolveDepthBuffer:!1,resolveStencilBuffer:!1,colorSpace:Kt.workingColorSpace}));const nt=p.state.transmissionRenderTarget[G.id],ht=G.viewport||L;nt.setSize(ht.z*x.transmissionResolutionScale,ht.w*x.transmissionResolutionScale);const yt=x.getRenderTarget(),pt=x.getActiveCubeFace(),Ft=x.getActiveMipmapLevel();x.setRenderTarget(nt),x.getClearColor($),X=x.getClearAlpha(),X<1&&x.setClearColor(16777215,.5),x.clear(),Vt&&bt.render(H);const Dt=x.toneMapping;x.toneMapping=Xn;const Ct=G.viewport;if(G.viewport!==void 0&&(G.viewport=void 0),p.setupLightsView(G),Yt===!0&&st.setGlobalState(x.clippingPlanes,G),Ws(R,H,G),Ot.updateMultisampleRenderTarget(nt),Ot.updateRenderTargetMipmap(nt),Bt.has("WEBGL_multisampled_render_to_texture")===!1){let $t=!1;for(let re=0,pe=N.length;re<pe;re++){const ce=N[re],le=ce.object,At=ce.geometry,he=ce.material,Jt=ce.group;if(he.side===Pe&&le.layers.test(G.layers)){const $e=he.side;he.side=Ie,he.needsUpdate=!0,xl(le,H,G,At,he,Jt),he.side=$e,he.needsUpdate=!0,$t=!0}}$t===!0&&(Ot.updateMultisampleRenderTarget(nt),Ot.updateRenderTargetMipmap(nt))}x.setRenderTarget(yt,pt,Ft),x.setClearColor($,X),Ct!==void 0&&(G.viewport=Ct),x.toneMapping=Dt}function Ws(R,N,H){const G=N.isScene===!0?N.overrideMaterial:null;for(let O=0,nt=R.length;O<nt;O++){const ht=R[O],yt=ht.object,pt=ht.geometry,Ft=ht.group;let Dt=ht.material;Dt.allowOverride===!0&&G!==null&&(Dt=G),yt.layers.test(H.layers)&&xl(yt,N,H,pt,Dt,Ft)}}function xl(R,N,H,G,O,nt){R.onBeforeRender(x,N,H,G,O,nt),R.modelViewMatrix.multiplyMatrices(H.matrixWorldInverse,R.matrixWorld),R.normalMatrix.getNormalMatrix(R.modelViewMatrix),O.onBeforeRender(x,N,H,G,R,nt),O.transparent===!0&&O.side===Pe&&O.forceSinglePass===!1?(O.side=Ie,O.needsUpdate=!0,x.renderBufferDirect(H,N,G,O,R,nt),O.side=Yn,O.needsUpdate=!0,x.renderBufferDirect(H,N,G,O,R,nt),O.side=Pe):x.renderBufferDirect(H,N,G,O,R,nt),R.onAfterRender(x,N,H,G,O,nt)}function $s(R,N,H){N.isScene!==!0&&(N=gt);const G=St.get(R),O=p.state.lights,nt=p.state.shadowsArray,ht=O.state.version,yt=k.getParameters(R,O.state,nt,N,H),pt=k.getProgramCacheKey(yt);let Ft=G.programs;G.environment=R.isMeshStandardMaterial?N.environment:null,G.fog=N.fog,G.envMap=(R.isMeshStandardMaterial?at:xe).get(R.envMap||G.environment),G.envMapRotation=G.environment!==null&&R.envMap===null?N.environmentRotation:R.envMapRotation,Ft===void 0&&(R.addEventListener("dispose",J),Ft=new Map,G.programs=Ft);let Dt=Ft.get(pt);if(Dt!==void 0){if(G.currentProgram===Dt&&G.lightsStateVersion===ht)return yl(R,yt),Dt}else yt.uniforms=k.getUniforms(R),R.onBeforeCompile(yt,x),Dt=k.acquireProgram(yt,pt),Ft.set(pt,Dt),G.uniforms=yt.uniforms;const Ct=G.uniforms;return(!R.isShaderMaterial&&!R.isRawShaderMaterial||R.clipping===!0)&&(Ct.clippingPlanes=st.uniform),yl(R,yt),G.needsLights=uu(R),G.lightsStateVersion=ht,G.needsLights&&(Ct.ambientLightColor.value=O.state.ambient,Ct.lightProbe.value=O.state.probe,Ct.directionalLights.value=O.state.directional,Ct.directionalLightShadows.value=O.state.directionalShadow,Ct.spotLights.value=O.state.spot,Ct.spotLightShadows.value=O.state.spotShadow,Ct.rectAreaLights.value=O.state.rectArea,Ct.ltc_1.value=O.state.rectAreaLTC1,Ct.ltc_2.value=O.state.rectAreaLTC2,Ct.pointLights.value=O.state.point,Ct.pointLightShadows.value=O.state.pointShadow,Ct.hemisphereLights.value=O.state.hemi,Ct.directionalShadowMap.value=O.state.directionalShadowMap,Ct.directionalShadowMatrix.value=O.state.directionalShadowMatrix,Ct.spotShadowMap.value=O.state.spotShadowMap,Ct.spotLightMatrix.value=O.state.spotLightMatrix,Ct.spotLightMap.value=O.state.spotLightMap,Ct.pointShadowMap.value=O.state.pointShadowMap,Ct.pointShadowMatrix.value=O.state.pointShadowMatrix),G.currentProgram=Dt,G.uniformsList=null,Dt}function _l(R){if(R.uniformsList===null){const N=R.currentProgram.getUniforms();R.uniformsList=Or.seqWithValue(N.seq,R.uniforms)}return R.uniformsList}function yl(R,N){const H=St.get(R);H.outputColorSpace=N.outputColorSpace,H.batching=N.batching,H.batchingColor=N.batchingColor,H.instancing=N.instancing,H.instancingColor=N.instancingColor,H.instancingMorph=N.instancingMorph,H.skinning=N.skinning,H.morphTargets=N.morphTargets,H.morphNormals=N.morphNormals,H.morphColors=N.morphColors,H.morphTargetsCount=N.morphTargetsCount,H.numClippingPlanes=N.numClippingPlanes,H.numIntersection=N.numClipIntersection,H.vertexAlphas=N.vertexAlphas,H.vertexTangents=N.vertexTangents,H.toneMapping=N.toneMapping}function cu(R,N,H,G,O){N.isScene!==!0&&(N=gt),Ot.resetTextureUnits();const nt=N.fog,ht=G.isMeshStandardMaterial?N.environment:null,yt=A===null?x.outputColorSpace:A.isXRRenderTarget===!0?A.texture.colorSpace:es,pt=(G.isMeshStandardMaterial?at:xe).get(G.envMap||ht),Ft=G.vertexColors===!0&&!!H.attributes.color&&H.attributes.color.itemSize===4,Dt=!!H.attributes.tangent&&(!!G.normalMap||G.anisotropy>0),Ct=!!H.morphAttributes.position,$t=!!H.morphAttributes.normal,re=!!H.morphAttributes.color;let pe=Xn;G.toneMapped&&(A===null||A.isXRRenderTarget===!0)&&(pe=x.toneMapping);const ce=H.morphAttributes.position||H.morphAttributes.normal||H.morphAttributes.color,le=ce!==void 0?ce.length:0,At=St.get(G),he=p.state.lights;if(Yt===!0&&(K===!0||R!==y)){const Be=R===y&&G.id===_;st.setState(G,R,Be)}let Jt=!1;G.version===At.__version?(At.needsLights&&At.lightsStateVersion!==he.state.version||At.outputColorSpace!==yt||O.isBatchedMesh&&At.batching===!1||!O.isBatchedMesh&&At.batching===!0||O.isBatchedMesh&&At.batchingColor===!0&&O.colorTexture===null||O.isBatchedMesh&&At.batchingColor===!1&&O.colorTexture!==null||O.isInstancedMesh&&At.instancing===!1||!O.isInstancedMesh&&At.instancing===!0||O.isSkinnedMesh&&At.skinning===!1||!O.isSkinnedMesh&&At.skinning===!0||O.isInstancedMesh&&At.instancingColor===!0&&O.instanceColor===null||O.isInstancedMesh&&At.instancingColor===!1&&O.instanceColor!==null||O.isInstancedMesh&&At.instancingMorph===!0&&O.morphTexture===null||O.isInstancedMesh&&At.instancingMorph===!1&&O.morphTexture!==null||At.envMap!==pt||G.fog===!0&&At.fog!==nt||At.numClippingPlanes!==void 0&&(At.numClippingPlanes!==st.numPlanes||At.numIntersection!==st.numIntersection)||At.vertexAlphas!==Ft||At.vertexTangents!==Dt||At.morphTargets!==Ct||At.morphNormals!==$t||At.morphColors!==re||At.toneMapping!==pe||At.morphTargetsCount!==le)&&(Jt=!0):(Jt=!0,At.__version=G.version);let $e=At.currentProgram;Jt===!0&&($e=$s(G,N,O));let _i=!1,Xe=!1,ls=!1;const ue=$e.getUniforms(),en=At.uniforms;if(vt.useProgram($e.program)&&(_i=!0,Xe=!0,ls=!0),G.id!==_&&(_=G.id,Xe=!0),_i||y!==R){vt.buffers.depth.getReversed()&&R.reversedDepth!==!0&&(R._reversedDepth=!0,R.updateProjectionMatrix()),ue.setValue(P,"projectionMatrix",R.projectionMatrix),ue.setValue(P,"viewMatrix",R.matrixWorldInverse);const He=ue.map.cameraPosition;He!==void 0&&He.setValue(P,mt.setFromMatrixPosition(R.matrixWorld)),Tt.logarithmicDepthBuffer&&ue.setValue(P,"logDepthBufFC",2/(Math.log(R.far+1)/Math.LN2)),(G.isMeshPhongMaterial||G.isMeshToonMaterial||G.isMeshLambertMaterial||G.isMeshBasicMaterial||G.isMeshStandardMaterial||G.isShaderMaterial)&&ue.setValue(P,"isOrthographic",R.isOrthographicCamera===!0),y!==R&&(y=R,Xe=!0,ls=!0)}if(O.isSkinnedMesh){ue.setOptional(P,O,"bindMatrix"),ue.setOptional(P,O,"bindMatrixInverse");const Be=O.skeleton;Be&&(Be.boneTexture===null&&Be.computeBoneTexture(),ue.setValue(P,"boneTexture",Be.boneTexture,Ot))}O.isBatchedMesh&&(ue.setOptional(P,O,"batchingTexture"),ue.setValue(P,"batchingTexture",O._matricesTexture,Ot),ue.setOptional(P,O,"batchingIdTexture"),ue.setValue(P,"batchingIdTexture",O._indirectTexture,Ot),ue.setOptional(P,O,"batchingColorTexture"),O._colorsTexture!==null&&ue.setValue(P,"batchingColorTexture",O._colorsTexture,Ot));const nn=H.morphAttributes;if((nn.position!==void 0||nn.normal!==void 0||nn.color!==void 0)&&tt.update(O,H,$e),(Xe||At.receiveShadow!==O.receiveShadow)&&(At.receiveShadow=O.receiveShadow,ue.setValue(P,"receiveShadow",O.receiveShadow)),G.isMeshGouraudMaterial&&G.envMap!==null&&(en.envMap.value=pt,en.flipEnvMap.value=pt.isCubeTexture&&pt.isRenderTargetTexture===!1?-1:1),G.isMeshStandardMaterial&&G.envMap===null&&N.environment!==null&&(en.envMapIntensity.value=N.environmentIntensity),Xe&&(ue.setValue(P,"toneMappingExposure",x.toneMappingExposure),At.needsLights&&hu(en,ls),nt&&G.fog===!0&&Y.refreshFogUniforms(en,nt),Y.refreshMaterialUniforms(en,G,W,Z,p.state.transmissionRenderTarget[R.id]),Or.upload(P,_l(At),en,Ot)),G.isShaderMaterial&&G.uniformsNeedUpdate===!0&&(Or.upload(P,_l(At),en,Ot),G.uniformsNeedUpdate=!1),G.isSpriteMaterial&&ue.setValue(P,"center",O.center),ue.setValue(P,"modelViewMatrix",O.modelViewMatrix),ue.setValue(P,"normalMatrix",O.normalMatrix),ue.setValue(P,"modelMatrix",O.matrixWorld),G.isShaderMaterial||G.isRawShaderMaterial){const Be=G.uniformsGroups;for(let He=0,ia=Be.length;He<ia;He++){const jn=Be[He];Ut.update(jn,$e),Ut.bind(jn,$e)}}return $e}function hu(R,N){R.ambientLightColor.needsUpdate=N,R.lightProbe.needsUpdate=N,R.directionalLights.needsUpdate=N,R.directionalLightShadows.needsUpdate=N,R.pointLights.needsUpdate=N,R.pointLightShadows.needsUpdate=N,R.spotLights.needsUpdate=N,R.spotLightShadows.needsUpdate=N,R.rectAreaLights.needsUpdate=N,R.hemisphereLights.needsUpdate=N}function uu(R){return R.isMeshLambertMaterial||R.isMeshToonMaterial||R.isMeshPhongMaterial||R.isMeshStandardMaterial||R.isShadowMaterial||R.isShaderMaterial&&R.lights===!0}this.getActiveCubeFace=function(){return T},this.getActiveMipmapLevel=function(){return C},this.getRenderTarget=function(){return A},this.setRenderTargetTextures=function(R,N,H){const G=St.get(R);G.__autoAllocateDepthBuffer=R.resolveDepthBuffer===!1,G.__autoAllocateDepthBuffer===!1&&(G.__useRenderToTexture=!1),St.get(R.texture).__webglTexture=N,St.get(R.depthTexture).__webglTexture=G.__autoAllocateDepthBuffer?void 0:H,G.__hasExternalTextures=!0},this.setRenderTargetFramebuffer=function(R,N){const H=St.get(R);H.__webglFramebuffer=N,H.__useDefaultFramebuffer=N===void 0};const du=P.createFramebuffer();this.setRenderTarget=function(R,N=0,H=0){A=R,T=N,C=H;let G=!0,O=null,nt=!1,ht=!1;if(R){const pt=St.get(R);if(pt.__useDefaultFramebuffer!==void 0)vt.bindFramebuffer(P.FRAMEBUFFER,null),G=!1;else if(pt.__webglFramebuffer===void 0)Ot.setupRenderTarget(R);else if(pt.__hasExternalTextures)Ot.rebindTextures(R,St.get(R.texture).__webglTexture,St.get(R.depthTexture).__webglTexture);else if(R.depthBuffer){const Ct=R.depthTexture;if(pt.__boundDepthTexture!==Ct){if(Ct!==null&&St.has(Ct)&&(R.width!==Ct.image.width||R.height!==Ct.image.height))throw new Error("WebGLRenderTarget: Attached DepthTexture is initialized to the incorrect size.");Ot.setupDepthRenderbuffer(R)}}const Ft=R.texture;(Ft.isData3DTexture||Ft.isDataArrayTexture||Ft.isCompressedArrayTexture)&&(ht=!0);const Dt=St.get(R).__webglFramebuffer;R.isWebGLCubeRenderTarget?(Array.isArray(Dt[N])?O=Dt[N][H]:O=Dt[N],nt=!0):R.samples>0&&Ot.useMultisampledRTT(R)===!1?O=St.get(R).__webglMultisampledFramebuffer:Array.isArray(Dt)?O=Dt[H]:O=Dt,L.copy(R.viewport),U.copy(R.scissor),z=R.scissorTest}else L.copy(Et).multiplyScalar(W).floor(),U.copy(kt).multiplyScalar(W).floor(),z=Zt;if(H!==0&&(O=du),vt.bindFramebuffer(P.FRAMEBUFFER,O)&&G&&vt.drawBuffers(R,O),vt.viewport(L),vt.scissor(U),vt.setScissorTest(z),nt){const pt=St.get(R.texture);P.framebufferTexture2D(P.FRAMEBUFFER,P.COLOR_ATTACHMENT0,P.TEXTURE_CUBE_MAP_POSITIVE_X+N,pt.__webglTexture,H)}else if(ht){const pt=N;for(let Ft=0;Ft<R.textures.length;Ft++){const Dt=St.get(R.textures[Ft]);P.framebufferTextureLayer(P.FRAMEBUFFER,P.COLOR_ATTACHMENT0+Ft,Dt.__webglTexture,H,pt)}}else if(R!==null&&H!==0){const pt=St.get(R.texture);P.framebufferTexture2D(P.FRAMEBUFFER,P.COLOR_ATTACHMENT0,P.TEXTURE_2D,pt.__webglTexture,H)}_=-1},this.readRenderTargetPixels=function(R,N,H,G,O,nt,ht,yt=0){if(!(R&&R.isWebGLRenderTarget)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");return}let pt=St.get(R).__webglFramebuffer;if(R.isWebGLCubeRenderTarget&&ht!==void 0&&(pt=pt[ht]),pt){vt.bindFramebuffer(P.FRAMEBUFFER,pt);try{const Ft=R.textures[yt],Dt=Ft.format,Ct=Ft.type;if(!Tt.textureFormatReadable(Dt)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.");return}if(!Tt.textureTypeReadable(Ct)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.");return}N>=0&&N<=R.width-G&&H>=0&&H<=R.height-O&&(R.textures.length>1&&P.readBuffer(P.COLOR_ATTACHMENT0+yt),P.readPixels(N,H,G,O,Rt.convert(Dt),Rt.convert(Ct),nt))}finally{const Ft=A!==null?St.get(A).__webglFramebuffer:null;vt.bindFramebuffer(P.FRAMEBUFFER,Ft)}}},this.readRenderTargetPixelsAsync=async function(R,N,H,G,O,nt,ht,yt=0){if(!(R&&R.isWebGLRenderTarget))throw new Error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");let pt=St.get(R).__webglFramebuffer;if(R.isWebGLCubeRenderTarget&&ht!==void 0&&(pt=pt[ht]),pt)if(N>=0&&N<=R.width-G&&H>=0&&H<=R.height-O){vt.bindFramebuffer(P.FRAMEBUFFER,pt);const Ft=R.textures[yt],Dt=Ft.format,Ct=Ft.type;if(!Tt.textureFormatReadable(Dt))throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in RGBA or implementation defined format.");if(!Tt.textureTypeReadable(Ct))throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in UnsignedByteType or implementation defined type.");const $t=P.createBuffer();P.bindBuffer(P.PIXEL_PACK_BUFFER,$t),P.bufferData(P.PIXEL_PACK_BUFFER,nt.byteLength,P.STREAM_READ),R.textures.length>1&&P.readBuffer(P.COLOR_ATTACHMENT0+yt),P.readPixels(N,H,G,O,Rt.convert(Dt),Rt.convert(Ct),0);const re=A!==null?St.get(A).__webglFramebuffer:null;vt.bindFramebuffer(P.FRAMEBUFFER,re);const pe=P.fenceSync(P.SYNC_GPU_COMMANDS_COMPLETE,0);return P.flush(),await Uf(P,pe,4),P.bindBuffer(P.PIXEL_PACK_BUFFER,$t),P.getBufferSubData(P.PIXEL_PACK_BUFFER,0,nt),P.deleteBuffer($t),P.deleteSync(pe),nt}else throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: requested read bounds are out of range.")},this.copyFramebufferToTexture=function(R,N=null,H=0){const G=Math.pow(2,-H),O=Math.floor(R.image.width*G),nt=Math.floor(R.image.height*G),ht=N!==null?N.x:0,yt=N!==null?N.y:0;Ot.setTexture2D(R,0),P.copyTexSubImage2D(P.TEXTURE_2D,H,0,0,ht,yt,O,nt),vt.unbindTexture()};const fu=P.createFramebuffer(),pu=P.createFramebuffer();this.copyTextureToTexture=function(R,N,H=null,G=null,O=0,nt=null){nt===null&&(O!==0?(Ns("WebGLRenderer: copyTextureToTexture function signature has changed to support src and dst mipmap levels."),nt=O,O=0):nt=0);let ht,yt,pt,Ft,Dt,Ct,$t,re,pe;const ce=R.isCompressedTexture?R.mipmaps[nt]:R.image;if(H!==null)ht=H.max.x-H.min.x,yt=H.max.y-H.min.y,pt=H.isBox3?H.max.z-H.min.z:1,Ft=H.min.x,Dt=H.min.y,Ct=H.isBox3?H.min.z:0;else{const nn=Math.pow(2,-O);ht=Math.floor(ce.width*nn),yt=Math.floor(ce.height*nn),R.isDataArrayTexture?pt=ce.depth:R.isData3DTexture?pt=Math.floor(ce.depth*nn):pt=1,Ft=0,Dt=0,Ct=0}G!==null?($t=G.x,re=G.y,pe=G.z):($t=0,re=0,pe=0);const le=Rt.convert(N.format),At=Rt.convert(N.type);let he;N.isData3DTexture?(Ot.setTexture3D(N,0),he=P.TEXTURE_3D):N.isDataArrayTexture||N.isCompressedArrayTexture?(Ot.setTexture2DArray(N,0),he=P.TEXTURE_2D_ARRAY):(Ot.setTexture2D(N,0),he=P.TEXTURE_2D),P.pixelStorei(P.UNPACK_FLIP_Y_WEBGL,N.flipY),P.pixelStorei(P.UNPACK_PREMULTIPLY_ALPHA_WEBGL,N.premultiplyAlpha),P.pixelStorei(P.UNPACK_ALIGNMENT,N.unpackAlignment);const Jt=P.getParameter(P.UNPACK_ROW_LENGTH),$e=P.getParameter(P.UNPACK_IMAGE_HEIGHT),_i=P.getParameter(P.UNPACK_SKIP_PIXELS),Xe=P.getParameter(P.UNPACK_SKIP_ROWS),ls=P.getParameter(P.UNPACK_SKIP_IMAGES);P.pixelStorei(P.UNPACK_ROW_LENGTH,ce.width),P.pixelStorei(P.UNPACK_IMAGE_HEIGHT,ce.height),P.pixelStorei(P.UNPACK_SKIP_PIXELS,Ft),P.pixelStorei(P.UNPACK_SKIP_ROWS,Dt),P.pixelStorei(P.UNPACK_SKIP_IMAGES,Ct);const ue=R.isDataArrayTexture||R.isData3DTexture,en=N.isDataArrayTexture||N.isData3DTexture;if(R.isDepthTexture){const nn=St.get(R),Be=St.get(N),He=St.get(nn.__renderTarget),ia=St.get(Be.__renderTarget);vt.bindFramebuffer(P.READ_FRAMEBUFFER,He.__webglFramebuffer),vt.bindFramebuffer(P.DRAW_FRAMEBUFFER,ia.__webglFramebuffer);for(let jn=0;jn<pt;jn++)ue&&(P.framebufferTextureLayer(P.READ_FRAMEBUFFER,P.COLOR_ATTACHMENT0,St.get(R).__webglTexture,O,Ct+jn),P.framebufferTextureLayer(P.DRAW_FRAMEBUFFER,P.COLOR_ATTACHMENT0,St.get(N).__webglTexture,nt,pe+jn)),P.blitFramebuffer(Ft,Dt,ht,yt,$t,re,ht,yt,P.DEPTH_BUFFER_BIT,P.NEAREST);vt.bindFramebuffer(P.READ_FRAMEBUFFER,null),vt.bindFramebuffer(P.DRAW_FRAMEBUFFER,null)}else if(O!==0||R.isRenderTargetTexture||St.has(R)){const nn=St.get(R),Be=St.get(N);vt.bindFramebuffer(P.READ_FRAMEBUFFER,fu),vt.bindFramebuffer(P.DRAW_FRAMEBUFFER,pu);for(let He=0;He<pt;He++)ue?P.framebufferTextureLayer(P.READ_FRAMEBUFFER,P.COLOR_ATTACHMENT0,nn.__webglTexture,O,Ct+He):P.framebufferTexture2D(P.READ_FRAMEBUFFER,P.COLOR_ATTACHMENT0,P.TEXTURE_2D,nn.__webglTexture,O),en?P.framebufferTextureLayer(P.DRAW_FRAMEBUFFER,P.COLOR_ATTACHMENT0,Be.__webglTexture,nt,pe+He):P.framebufferTexture2D(P.DRAW_FRAMEBUFFER,P.COLOR_ATTACHMENT0,P.TEXTURE_2D,Be.__webglTexture,nt),O!==0?P.blitFramebuffer(Ft,Dt,ht,yt,$t,re,ht,yt,P.COLOR_BUFFER_BIT,P.NEAREST):en?P.copyTexSubImage3D(he,nt,$t,re,pe+He,Ft,Dt,ht,yt):P.copyTexSubImage2D(he,nt,$t,re,Ft,Dt,ht,yt);vt.bindFramebuffer(P.READ_FRAMEBUFFER,null),vt.bindFramebuffer(P.DRAW_FRAMEBUFFER,null)}else en?R.isDataTexture||R.isData3DTexture?P.texSubImage3D(he,nt,$t,re,pe,ht,yt,pt,le,At,ce.data):N.isCompressedArrayTexture?P.compressedTexSubImage3D(he,nt,$t,re,pe,ht,yt,pt,le,ce.data):P.texSubImage3D(he,nt,$t,re,pe,ht,yt,pt,le,At,ce):R.isDataTexture?P.texSubImage2D(P.TEXTURE_2D,nt,$t,re,ht,yt,le,At,ce.data):R.isCompressedTexture?P.compressedTexSubImage2D(P.TEXTURE_2D,nt,$t,re,ce.width,ce.height,le,ce.data):P.texSubImage2D(P.TEXTURE_2D,nt,$t,re,ht,yt,le,At,ce);P.pixelStorei(P.UNPACK_ROW_LENGTH,Jt),P.pixelStorei(P.UNPACK_IMAGE_HEIGHT,$e),P.pixelStorei(P.UNPACK_SKIP_PIXELS,_i),P.pixelStorei(P.UNPACK_SKIP_ROWS,Xe),P.pixelStorei(P.UNPACK_SKIP_IMAGES,ls),nt===0&&N.generateMipmaps&&P.generateMipmap(he),vt.unbindTexture()},this.initRenderTarget=function(R){St.get(R).__webglFramebuffer===void 0&&Ot.setupRenderTarget(R)},this.initTexture=function(R){R.isCubeTexture?Ot.setTextureCube(R,0):R.isData3DTexture?Ot.setTexture3D(R,0):R.isDataArrayTexture||R.isCompressedArrayTexture?Ot.setTexture2DArray(R,0):Ot.setTexture2D(R,0),vt.unbindTexture()},this.resetState=function(){T=0,C=0,A=null,vt.reset(),lt.reset()},typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}get coordinateSystem(){return Sn}get outputColorSpace(){return this._outputColorSpace}set outputColorSpace(t){this._outputColorSpace=t;const e=this.getContext();e.drawingBufferColorSpace=Kt._getDrawingBufferColorSpace(t),e.unpackColorSpace=Kt._getUnpackColorSpace()}}const Gt=(i,t,e)=>new B(i,t,-e),Ln=(i,t)=>({x:Math.sin(i*Math.PI/180)*t,z:Math.cos(i*Math.PI/180)*t});function zS(i){const t=document.createElement("canvas");t.width=256,t.height=256;const e=t.getContext("2d"),n=i==="Night"?"#2f7a33":"#3d8f3a",s=i==="Night"?"#286c2c":"#357f33";for(let a=0;a<8;a++)e.fillStyle=a%2?n:s,e.fillRect(a*32,0,32,256);for(let a=0;a<2500;a++)e.fillStyle=`rgba(0,0,0,${Math.random()*.06})`,e.fillRect(Math.random()*256,Math.random()*256,2,2);const r=new as(t);return r.wrapS=r.wrapT=ts,r.colorSpace=Me,r.anisotropy=8,r}function kS(){const i=document.createElement("canvas");i.width=128,i.height=128;const t=i.getContext("2d");t.fillStyle="#b07a4a",t.fillRect(0,0,128,128);for(let n=0;n<1800;n++){const s=Math.random();t.fillStyle=s>.5?`rgba(255,220,180,${Math.random()*.12})`:`rgba(60,30,10,${Math.random()*.12})`,t.fillRect(Math.random()*128,Math.random()*128,2,2)}const e=new as(i);return e.wrapS=e.wrapT=ts,e.colorSpace=Me,e.repeat.set(20,20),e}function HS(i,t){const e=document.createElement("canvas");e.width=512,e.height=256;const n=e.getContext("2d");n.fillStyle=i,n.fillRect(0,0,512,256);const s=[...t,"#f0f0f0","#d8c3a0","#3a3a3a","#c94b4b","#4b6fc9","#e0c050","#8a5a3a"];for(let a=0;a<16;a++){n.fillStyle="rgba(0,0,0,0.25)",n.fillRect(0,a*16+13,512,3);for(let o=0;o<40;o++){if(Math.random()<.2)continue;n.fillStyle=s[Math.floor(Math.random()*s.length)];const l=o*12.8+Math.random()*3,c=a*16+Math.random()*2;n.fillRect(l,c+5,9,8),n.fillStyle=Math.random()<.5?"#e7c3a0":"#8d5b3e",n.beginPath(),n.arc(l+4.5,c+3.5,3.2,0,Math.PI*2),n.fill()}}const r=new as(e);return r.wrapS=r.wrapT=ts,r.colorSpace=Me,r}function GS(i,t="#ffffff",e=64){const n=document.createElement("canvas");n.width=256,n.height=128;const s=n.getContext("2d");s.font=`bold ${e}px Oswald, Impact, sans-serif`,s.fillStyle=t,s.textAlign="center",s.textBaseline="middle",s.fillText(i,128,64);const r=new as(n);r.colorSpace=Me;const a=new cp(new Vh({map:r,depthWrite:!1}));return a.scale.set(16,8,1),a}function jc(i,t,e){const n=new pl;n.moveTo(i[0].x,i[0].z);for(let a=1;a<i.length;a++)n.lineTo(i[a].x,i[a].z);const s=new ta(n,1),r=new Mt(s,e);return r.rotation.x=-Math.PI/2,r.position.y=t,r.receiveShadow=!0,r}function Hi(i,t,e,n,s){const r=t.x-i.x,a=t.z-i.z,o=Math.hypot(r,a),l=new on(e,o),c=new Mt(l,s);return c.rotation.x=-Math.PI/2,c.rotation.z=-Math.atan2(r,a),c.position.set((i.x+t.x)/2,n,-(i.z+t.z)/2),c}function VS(i,t,e){const n=new ve,s=e.time==="Night",r=e.time==="Afternoon",a=new Nt(s?"#0b1530":r?"#f2b38a":e.weather==="Clear"?"#7fb9f0":"#9aa6b2");e.weather!=="Clear"&&!s&&a.lerp(new Nt("#8a949e"),.6);const o=new Zp(s?"#9fb4ff":"#ffffff",s?"#203020":"#4a6a3a",s?.55:.9);n.add(o);const l=new Rc(s?"#fff6e8":r?"#ffd2a0":"#fffaf0",s?2:r?2.2:2.6);l.position.copy(r?Gt(-220,160,220):s?Gt(0,400,150):Gt(-150,380,-120)),l.target.position.copy(Gt(0,0,110)),l.castShadow=!0;const c="ontouchstart"in window&&Math.min(screen.width,screen.height)<900;l.shadow.mapSize.set(c?1024:2048,c?1024:2048);const u=l.shadow.camera;u.left=-220,u.right=220,u.top=220,u.bottom=-220,u.near=10,u.far=900,l.shadow.bias=-8e-4,n.add(l,l.target);const h=new Rc(s?"#e8eeff":"#fff4e0",s?1.1:.7);h.position.copy(Gt(40,220,-320)),h.target.position.copy(Gt(0,0,80)),n.add(h,h.target),e.weather==="Cloudy"&&(l.intensity*=.55,o.intensity*=1.1),e.weather==="Light Rain"&&(l.intensity*=.45,o.intensity*=1);const d=new xn(2500,32,16),f=a.clone().multiplyScalar(s?.6:.85),g=s?new Nt("#25325a"):r?new Nt("#ffd7a8"):a.clone().lerp(new Nt("#ffffff"),.45),v=[],m=d.attributes.position;for(let at=0;at<m.count;at++){const w=m.getY(at)/2500,S=g.clone().lerp(f,Math.max(0,w)**.6);v.push(S.r,S.g,S.b)}d.setAttribute("color",new qt(v,3)),n.add(new Mt(d,new ke({vertexColors:!0,side:Ie,fog:!1})));const p=zS(e.time);p.repeat.set(36,36),p.rotation=Math.PI/4;const M=new Mt(new gi(900,64),new ge({map:p,roughness:.95}));M.rotation.x=-Math.PI/2,M.receiveShadow=!0,n.add(M);const b=new ge({map:kS(),roughness:1}),x=[{x:0,z:0}];for(let at=-45;at<=45;at+=2){const w=at*Math.PI/180,S=Math.cos(w),F=60.5*S+Math.sqrt(60.5*60.5*S*S-60.5*60.5+9025);x.push({x:Math.sin(w)*F,z:Math.cos(w)*F})}n.add(jc(x,.03,b));const E=new ge({map:p,roughness:.95});n.add(jc([{x:0,z:9},{x:55,z:63.64},{x:0,z:118.3},{x:-55,z:63.64}],.05,E));const T=(at,w,S,F,k)=>{const Y=new Mt(new gi(S,32),k);return Y.rotation.x=-Math.PI/2,Y.position.copy(Gt(at,F,w)),Y.receiveShadow=!0,n.add(Y),Y};T(0,0,13,.07,b);const C=new Mt(new qi(9,9.5,.8,32),b);C.position.copy(Gt(0,.4,60.5)),C.receiveShadow=!0,n.add(C);const A=new ge({color:"#f4f4f4",roughness:.6}),_=new Mt(new je(2,.1,.5),A);_.position.copy(Gt(0,.85,60.5)),n.add(_);for(const[at,w]of[[63.64,63.64],[0,127.28],[-63.64,63.64]]){T(at,w,7,.06,b);const S=new Mt(new je(1.5,.35,1.5),A);S.position.copy(Gt(at,.18,w)),S.rotation.y=Math.PI/4,S.castShadow=!0,n.add(S)}const y=new pl;y.moveTo(-.708,1.417),y.lineTo(.708,1.417),y.lineTo(.708,.708),y.lineTo(0,0),y.lineTo(-.708,.708),y.lineTo(-.708,1.417);const L=new Mt(new ta(y),A);L.rotation.x=-Math.PI/2,L.position.y=.09,n.add(L);const U=new ke({color:"#f2f2f2"}),z=Ln(-45,Oe(i,-45)),$=Ln(45,Oe(i,45));n.add(Hi({x:0,z:0},z,.35,.1,U)),n.add(Hi({x:0,z:0},$,.35,.1,U));for(const at of[-1,1]){const w=at*1.2,S=at*5.2,F=-2.5,k=3.5;n.add(Hi({x:w,z:F},{x:w,z:k},.25,.1,U)),n.add(Hi({x:S,z:F},{x:S,z:k},.25,.1,U)),n.add(Hi({x:w,z:F},{x:S,z:F},.25,.1,U)),n.add(Hi({x:w,z:k},{x:S,z:k},.25,.1,U))}const X=new ge({color:i.wallColor,roughness:.85,side:Pe}),q=new ge({color:"#e8c33a",roughness:.6,side:Pe}),Z=[],W=[],rt=[],ut=[],Et=[],kt=[];let Zt=0;for(let at=-45;at<=45;at+=1){const w=Oe(i,at),S=oi(i,at),F=Ln(at,w),k=Ln(at,w-15);if(Z.push(k.x,.08,-k.z,F.x,.08,-F.z),rt.push(F.x,0,-F.z,F.x,S,-F.z),Et.push(F.x,S,-F.z,F.x,S+.7,-F.z),at>-45){const Y=(Zt-1)*2,V=Zt*2;W.push(Y,Y+1,V,V,Y+1,V+1),ut.push(Y,Y+1,V,V,Y+1,V+1),kt.push(Y,Y+1,V,V,Y+1,V+1)}Zt++}const ee=(at,w,S)=>{const F=new fe;F.setAttribute("position",new qt(at,3)),F.setIndex(w),F.computeVertexNormals();const k=new Mt(F,S);return k.receiveShadow=!0,k};if(n.add(ee(Z,W,new ge({color:"#9a6a43",roughness:1,side:Pe}))),n.add(ee(rt,ut,X)),n.add(ee(Et,kt,q)),i.id==="wrigley"){const at=[];for(let S=-44;S<=44;S+=1){const F=Ln(S,Oe(i,S)-.3);at.push(F.x,.5,-F.z,F.x,oi(i,S)-.5,-F.z)}const w=[];for(let S=1;S<at.length/6;S++){const F=(S-1)*2,k=S*2;w.push(F,F+1,k,k,F+1,k+1)}n.add(ee(at,w,new ge({color:"#2f6b2a",roughness:1,side:Pe})))}for(const[at,w]of[[-45,0],[-22.5,1],[0,2],[22.5,3],[45,4]]){const S=i.dims[w],F=Ln(at+(at===-45?2.5:at===45?-2.5:0),S-.8),k=GS(String(S),"#ffffff",72);k.position.copy(Gt(F.x,Math.min(oi(i,at),8)*.55+1.5,F.z)),k.scale.set(10,5,1),n.add(k)}const Yt=new ge({color:"#f2d21b",emissive:"#4a3d00",roughness:.4});for(const at of[-45,45]){const w=Ln(at,Oe(i,at)),S=Math.max(60,oi(i,at)+45),F=new Mt(new qi(.6,.6,S,10),Yt);F.position.copy(Gt(w.x,S/2,w.z)),n.add(F)}const K=HS(i.seatColor,[t.colors.primary,t.colors.secondary]),j=new ge({map:K,roughness:.9,side:Pe}),mt=new ge({color:"#16221a",roughness:1,side:Pe}),Pt=at=>{const w=Math.abs(at);if(w<=45)return{r:Oe(i,at),h:oi(i,at)};const S=Math.sin(w*Math.PI/180),F=Math.cos(w*Math.PI/180),k=S-F,Y=k>.01?i.foulWidth*Math.SQRT2/k:9999;return{r:Math.max(i.backstop,Math.min(Oe(i,45*Math.sign(at)),Y)),h:4}},gt=(at,w,S,F,k,Y,V,wt)=>{const st=[],_t=[],bt=[];let tt=0;for(let D=k;D<=Y;D+=2){const et=Pt(D),it=et.r+2+F,dt=it+at,Q=D*Math.PI/180,J=et.h+2+S,xt=J+w;if(st.push(Math.sin(Q)*it,J,-Math.cos(Q)*it,Math.sin(Q)*dt,xt,-Math.cos(Q)*dt),_t.push(D/9,0,D/9,at/55),tt>0){const It=(tt-1)*2,jt=tt*2;bt.push(It,It+1,jt,jt,It+1,jt+1)}tt++}const ot=new fe;ot.setAttribute("position",new qt(st,3)),ot.setAttribute("uv",new qt(_t,2)),ot.setIndex(bt),ot.computeVertexNormals();const Lt=new Mt(ot,wt?mt:V);n.add(Lt);const Rt=[],lt=[];tt=0;for(let D=k;D<=Y;D+=2){const et=Pt(D),it=et.r+2+F,dt=D*Math.PI/180;if(Rt.push(Math.sin(dt)*it,0,-Math.cos(dt)*it,Math.sin(dt)*it,et.h+2+S,-Math.cos(dt)*it),tt>0){const Q=(tt-1)*2,J=tt*2;lt.push(Q,Q+1,J,J,Q+1,J+1)}tt++}const Ut=new fe;Ut.setAttribute("position",new qt(Rt,3)),Ut.setIndex(lt),Ut.computeVertexNormals(),n.add(new Mt(Ut,new ge({color:"#2a2f38",roughness:.9,side:Pe})))};if(gt(70,38,0,0,-46,-8,j,!1),gt(70,30,-2,0,-8,8,j,!0),gt(70,38,0,0,8,46,j,!1),gt(95,34,0,0,46,180,j,!1),gt(95,34,0,0,-180,-46,j,!1),gt(60,30,42,110,50,180,j,!1),gt(60,30,42,110,-180,-50,j,!1),i.roof==="dome"){const at=new Mt(new xn(700,32,12,0,Math.PI*2,0,Math.PI/6),new ge({color:"#d9dde3",side:Ie,roughness:1}));at.position.copy(Gt(0,-380,160)),n.add(at)}for(const at of[-1,1]){const w={x:at*Math.SQRT1_2,z:Math.SQRT1_2},S={x:at*Math.SQRT1_2,z:-Math.SQRT1_2},F={x:w.x*55+S.x*(i.foulWidth+3),z:w.z*55+S.z*(i.foulWidth+3)},k=new Mt(new je(48,7,9),new ge({color:"#15181d",roughness:1}));k.position.copy(Gt(F.x,2.5,F.z)),k.rotation.y=Math.atan2(w.z,w.x),n.add(k);const Y=new Mt(new je(50,.8,10),new ge({color:t.colors.primary,roughness:.6}));Y.position.copy(Gt(F.x,6.4,F.z)),Y.rotation.y=k.rotation.y,n.add(Y)}const Vt=-26,we=Oe(i,Vt)+75,P=Ln(Vt,we),ne=document.createElement("canvas");ne.width=1024,ne.height=440;const Bt=new as(ne);Bt.colorSpace=Me;const Tt=new Mt(new on(130,56),new ke({map:Bt,toneMapped:!1})),vt=Gt(P.x,78,P.z);Tt.position.copy(vt),Tt.lookAt(Gt(0,30,0)),n.add(Tt);const ie=new Mt(new je(136,62,3),new ge({color:"#111",roughness:.8}));ie.position.copy(Tt.position),ie.quaternion.copy(Tt.quaternion),ie.translateZ(-2),n.add(ie);const St=new Mt(new je(6,60,6),new ge({color:"#222"}));St.position.copy(Gt(P.x,25,P.z)),n.add(St);const Ot=new ge({color:"#3a3f47",roughness:.7}),xe=new ge({color:"#fffbe8",emissive:s?"#fff6d0":"#555",emissiveIntensity:s?2.2:.3});for(const at of[-120,-70,-30,30,70,120]){const w=Pt(at),S=Ln(at,w.r+120),F=new Mt(new qi(1.5,2.2,150,8),Ot);F.position.copy(Gt(S.x,75,S.z)),n.add(F);const k=new Mt(new je(26,12,2),xe);k.position.copy(Gt(S.x,155,S.z)),k.lookAt(Gt(0,0,120)),n.add(k)}return{group:n,scoreboard:{canvas:ne,tex:Bt,pos:vt},fireworksOrigin:Gt(P.x,110,P.z),sun:l,hemi:o,skyColor:a}}function WS(i,t){const e=i.canvas.getContext("2d"),n=i.canvas.width,s=i.canvas.height;e.fillStyle="#0a0d12",e.fillRect(0,0,n,s);const r=Math.max(9,t.innings,t.away.line.length,t.home.line.length),a=170,o=Math.min(56,(n-a-230)/r);e.font="bold 34px Oswald, Impact, sans-serif",e.textAlign="center",e.textBaseline="middle",e.fillStyle="#ffd34d";for(let c=0;c<r;c++)e.fillText(String(c+1),a+o*c+o/2,40);["R","H","E"].forEach((c,u)=>e.fillText(c,n-200+u*66+33,40));const l=(c,u,h)=>{e.textAlign="left",e.fillStyle=c.color,e.fillRect(16,u-30,8,60),e.fillStyle="#fff",e.font="bold 46px Oswald, Impact, sans-serif",e.fillText(c.abbr,34,u),e.textAlign="center",e.font="bold 40px Oswald, Impact, sans-serif";for(let d=0;d<r;d++){const f=c.line[d],g=t.half==="top"===h&&t.inning===d+1;e.fillStyle=g?"#ffd34d":"#e8e8e8",e.fillText(f===void 0?g?"0":"":String(f),a+o*d+o/2,u)}e.fillStyle="#ffffff",[c.r,c.h,c.e].forEach((d,f)=>e.fillText(String(d),n-200+f*66+33,u))};l(t.away,110,!0),l(t.home,180,!1),e.strokeStyle="#2a3140",e.lineWidth=3,e.beginPath(),e.moveTo(10,225),e.lineTo(n-10,225),e.stroke(),e.textAlign="left",e.font="bold 36px Oswald, Impact, sans-serif",e.fillStyle="#9fb3c8",e.fillText("AT BAT",30,270),e.fillText("PITCHING",30,320),e.fillStyle="#fff",e.fillText(t.batter.toUpperCase(),190,270),e.fillText(t.pitcher.toUpperCase(),190,320),e.textAlign="right",e.fillStyle="#ffd34d",e.fillText(`B ${t.balls}  S ${t.strikes}  O ${t.outs}`,n-30,270),e.fillStyle="#7fe08a",e.fillText(t.mph,n-30,320),e.textAlign="center",e.font="bold 50px Oswald, Impact, sans-serif",e.fillStyle="#ffffff",e.fillText(t.message,n/2,395),i.tex.needsUpdate=!0}class $S{constructor(t){I(this,"cam");I(this,"mode","menu");I(this,"pos",new B(0,80,150));I(this,"look",new B(0,0,-150));I(this,"tPos",new B);I(this,"tLook",new B);I(this,"fov",45);I(this,"tFov",45);I(this,"shakeAmt",0);I(this,"clock",0);I(this,"snap",!0);I(this,"replay",{yaw:.6,pitch:.45,dist:120,target:new B});this.cam=new rn(45,t,.3,6e3)}setMode(t,e=!1){t!==this.mode&&(t==="field"&&(this.mode==="batting"||this.mode==="pitching")&&(e=!0),(t==="batting"||t==="pitching")&&this.mode!=="menu"&&(e=!0),this.mode=t,e&&(this.snap=!0))}shake(t){this.shakeAmt=Math.max(this.shakeAmt,t)}update(t,e){this.clock+=t;let n=3.2;switch(this.mode){case"menu":{const r=this.clock*.06;this.tPos.copy(Gt(Math.sin(r)*260,110,150+Math.cos(r)*260)),this.tLook.copy(Gt(0,0,150)),this.tFov=50,n=1.5;break}case"batting":this.tPos.copy(Gt(0,6.3,-19.5)),this.tLook.copy(Gt(0,2.9,25)),this.tFov=30,n=5;break;case"pitching":this.tPos.copy(Gt(4.2,8.4,83)),this.tLook.copy(Gt(0,2.9,0)),this.tFov=16,n=5;break;case"overview":this.tPos.copy(Gt(0,70,-95)),this.tLook.copy(Gt(0,0,140)),this.tFov=50,n=2;break;case"field":{const r=e.ball,a=e.focus??{x:r.x,z:r.z},o=e.focus&&r.visible?a.x*.5+r.x*.5:a.x,l=e.focus&&r.visible?a.z*.5+r.z*.5:a.z,c=Math.hypot(o,l),u=r.visible?Math.min(45,r.y*.3):0;this.tPos.copy(Gt(o*.25,50+c*.14+u,-58+l*.38)),this.tLook.copy(Gt(o*.92,Math.min(25,r.visible?r.y*.3:0),l*.95+8)),this.tFov=46,n=3;break}case"hr":{const r=e.ball,a=Math.hypot(r.x,r.z)||1,o=r.x/a,l=r.z/a;this.tPos.copy(Gt(r.x-o*70+l*25,Math.max(20,r.y+12),r.z-l*70-o*25)),this.tLook.copy(Gt(r.x,r.y,r.z)),this.tFov=42,n=4;break}case"replay":{const r=this.replay,a=r.target;this.tLook.copy(a),this.tPos.set(a.x+Math.sin(r.yaw)*Math.cos(r.pitch)*r.dist,a.y+Math.sin(r.pitch)*r.dist,a.z+Math.cos(r.yaw)*Math.cos(r.pitch)*r.dist),this.tFov=45,n=6;break}}const s=this.snap?1:1-Math.exp(-n*t);if(this.snap=!1,this.pos.lerp(this.tPos,s),this.look.lerp(this.tLook,s),this.fov+=(this.tFov-this.fov)*s,this.cam.position.copy(this.pos),this.shakeAmt>.001){const r=this.shakeAmt;this.cam.position.x+=(Math.random()-.5)*r,this.cam.position.y+=(Math.random()-.5)*r,this.shakeAmt*=Math.exp(-6*t)}this.cam.lookAt(this.look),Math.abs(this.cam.fov-this.fov)>.01&&(this.cam.fov=this.fov,this.cam.updateProjectionMatrix())}groundAxes(){const t=new B;this.cam.getWorldDirection(t);const e=t.x,n=-t.z,s=Math.hypot(e,n)||1,r={x:e/s,z:n/s};return{fwd:r,right:{x:r.z,z:-r.x}}}}const Zr=new Map;function ys(i,t,e,n=!0){const s=`b${i},${t},${e},${n}`;let r=Zr.get(s);return r||(r=new je(i,t,e),n&&r.translate(0,-t/2,0),Zr.set(s,r)),r}function wr(i,t){const e=`c${i},${t}`;let n=Zr.get(e);return n||(n=new ul(i,t,4,10),n.translate(0,-(t/2+i),0),Zr.set(e,n)),n}const Qc=new Map;function Je(i,t=.75,e=0){const n=`${i}|${t}|${e}`;let s=Qc.get(n);return s||(s=new ge({color:i,roughness:t,metalness:e}),Qc.set(n,s)),s}const th=new Map;function XS(i,t){const e=`${i}|${t}`;let n=th.get(e);if(n)return n;const s=document.createElement("canvas");s.width=128,s.height=128;const r=s.getContext("2d");return r.clearRect(0,0,128,128),r.font="bold 84px Oswald, Impact, sans-serif",r.textAlign="center",r.textBaseline="middle",r.lineWidth=6,r.strokeStyle="rgba(255,255,255,0.85)",r.strokeText(String(i),64,70),r.fillStyle=t,r.fillText(String(i),64,70),n=new as(s),n.colorSpace=Me,th.set(e,n),n}class qS{constructor(t,e,n,s){I(this,"root",new ve);I(this,"body",new ve);I(this,"torso",new ve);I(this,"head",new ve);I(this,"lThigh",new ve);I(this,"lShin",new ve);I(this,"rThigh",new ve);I(this,"rShin",new ve);I(this,"lArm",new ve);I(this,"lFore",new ve);I(this,"rArm",new ve);I(this,"rFore",new ve);I(this,"bat",null);I(this,"glove",null);I(this,"ring");I(this,"shadow");I(this,"phase",0);I(this,"throwsLeft",!1);I(this,"materials",[]);this.throwsLeft=n;const r=Je(t.jersey),a=Je(t.pants),o=Je(t.trim),l=Je(t.skin,.6),c=Je("#141414",.5);this.root.add(this.body),this.body.position.y=3.05;const u=(M,b,x)=>{M.position.set(x,0,0),M.add(new Mt(wr(.24,1.15),a)),b.position.y=-1.55;const E=new Mt(wr(.2,1.05),t.umpire?a:o);b.add(E);const T=new Mt(ys(.38,.28,.75,!1),c);T.position.set(0,-1.42,.16),b.add(T),M.add(b),this.body.add(M)};u(this.lThigh,this.lShin,-.3),u(this.rThigh,this.rShin,.3),this.body.add(this.torso);const h=new Mt(ys(1.3,1.95,.72,!1),t.catcherGear?Je("#2a2a30"):r);h.position.y=.95,this.torso.add(h);const d=new Mt(ys(1.32,.22,.74,!1),Je("#1b1b1b"));if(d.position.y=.05,this.torso.add(d),!t.umpire&&!t.catcherGear){const M=XS(e,t.number),b=new Mt(new on(.95,.95),new ke({map:M,transparent:!0,depthWrite:!1}));b.position.set(0,1.15,-.37),b.rotation.y=Math.PI,this.torso.add(b);const x=new Mt(new on(.55,.55),new ke({map:M,transparent:!0,depthWrite:!1}));x.position.set(.32,1.35,.37),this.torso.add(x)}this.head.position.y=2.15,this.torso.add(this.head);const f=new Mt(new xn(.4,14,10),l);f.position.y=.35,this.head.add(f);const g=t.umpire?Je("#151515"):t.helmet?Je(t.cap,.25,.3):Je(t.cap),v=new Mt(new xn(t.helmet?.47:.43,14,8,0,Math.PI*2,0,Math.PI/2),g);v.position.y=.42,this.head.add(v);const m=new Mt(ys(.62,.06,.42,!1),g);if(m.position.set(0,.45,.42),this.head.add(m),t.helmet){const M=new Mt(new xn(.2,8,6),g);M.position.set(.38,.32,0),this.head.add(M)}if(t.catcherGear){const M=new Mt(ys(.7,.75,.15,!1),Je("#222222",.4,.4));M.position.set(0,.32,.4),this.head.add(M)}const p=(M,b,x)=>{M.position.set(x,1.8,0),M.add(new Mt(wr(.18,.75),t.umpire?r:o)),b.position.y=-1.1,b.add(new Mt(wr(.15,.7),l)),M.add(b),this.torso.add(M)};if(p(this.lArm,this.lFore,-.82),p(this.rArm,this.rFore,.82),!s&&!t.umpire&&(this.glove=new Mt(new xn(.32,10,8),Je("#6b3f1d",.8)),this.glove.scale.set(1,1.2,.6),this.glove.position.y=-1.2,(n?this.rFore:this.lFore).add(this.glove)),s){const M=new qi(.09,.04,2.9,10);M.translate(0,1.45,0),this.bat=new Mt(M,Je("#c89a5b",.5)),this.bat.position.y=-1.15,this.rFore.add(this.bat)}this.ring=new Mt(new fi(1.8,2.4,32),new ke({color:"#3fa9ff",transparent:!0,opacity:.85,depthWrite:!1})),this.ring.rotation.x=-Math.PI/2,this.ring.position.y=.06,this.ring.visible=!1,this.root.add(this.ring),this.shadow=new Mt(new gi(1.3,16),new ke({color:"#000",transparent:!0,opacity:.28,depthWrite:!1})),this.shadow.rotation.x=-Math.PI/2,this.shadow.position.y=.04,this.root.add(this.shadow),this.root.traverse(M=>{M.isMesh&&M!==this.ring&&M!==this.shadow&&(M.castShadow=!0)})}setOpacity(t){this.root.traverse(e=>{const n=e;if(!n.isMesh||n===this.ring||n===this.shadow)return;const s=n.material;if(this.materials.includes(s))s.opacity=t;else if(t<1){const r=s.clone();r.transparent=!0,r.opacity=t,n.material=r,this.materials.push(r)}})}reset(){for(const t of[this.body,this.torso,this.head,this.lThigh,this.lShin,this.rThigh,this.rShin,this.lArm,this.lFore,this.rArm,this.rFore])t.rotation.set(0,0,0);this.body.position.set(0,3.05,0),this.root.position.y=0,this.bat&&this.bat.rotation.set(0,0,0)}animate(t,e,n,s,r,a){this.reset();const o=r?-1:1,l=r?this.lArm:this.rArm,c=r?this.lFore:this.rFore,u=r?this.rArm:this.lArm,h=r?this.rFore:this.lFore;switch(t){case"run":case"trot":{this.phase+=n*s/5.2*Math.PI*2*(t==="trot"?.75:1);const d=Math.min(1,n/18)*(t==="trot"?.55:.85),f=Math.sin(this.phase);this.lThigh.rotation.x=f*d,this.rThigh.rotation.x=-f*d,this.lShin.rotation.x=-Math.max(0,-f)*d*1.4-.2,this.rShin.rotation.x=-Math.max(0,f)*d*1.4-.2,this.lArm.rotation.x=-f*d*.9,this.rArm.rotation.x=f*d*.9,this.lFore.rotation.x=-.9,this.rFore.rotation.x=-.9,this.body.rotation.x=.18*d,this.body.position.y=3.05+Math.abs(Math.cos(this.phase))*.18*d;break}case"ready":{const d=Math.sin(a*2)*.02;this.body.position.y=2.75,this.body.rotation.x=.35,this.lThigh.rotation.x=-.45,this.rThigh.rotation.x=-.45,this.lShin.rotation.x=.55,this.rShin.rotation.x=.55,this.lThigh.rotation.z=-.15,this.rThigh.rotation.z=.15,this.lArm.rotation.x=-.7+d,this.rArm.rotation.x=-.7+d,this.lFore.rotation.x=-.6,this.rFore.rotation.x=-.6;break}case"idle":{this.lArm.rotation.z=-.08,this.rArm.rotation.z=.08,this.torso.rotation.y=Math.sin(a*.7)*.05;break}case"crouch":{this.body.position.y=1.55,this.body.rotation.x=.25,this.lThigh.rotation.x=-1.45,this.rThigh.rotation.x=-1.45,this.lThigh.rotation.z=-.35,this.rThigh.rotation.z=.35,this.lShin.rotation.x=1.9,this.rShin.rotation.x=1.9,u.rotation.x=-1.2,h.rotation.x=-.5,l.rotation.x=-.3,c.rotation.x=-.4;break}case"bat":{const d=Math.sin(a*3.2)*.06;this.body.position.y=2.85,this.lThigh.rotation.x=-.25,this.rThigh.rotation.x=-.25,this.lShin.rotation.x=.35,this.rShin.rotation.x=.35,this.lThigh.rotation.z=-.25,this.rThigh.rotation.z=.25,this.torso.rotation.y=-.25*o,this.rArm.rotation.set(-1.6,0,.5*o+d),this.lArm.rotation.set(-1.5,0,.9*o),this.rFore.rotation.x=-1.2,this.lFore.rotation.x=-1.4,this.bat&&this.bat.rotation.set(1.2,0,-.8*o+d);break}case"swing":{const d=Math.min(1,e),f=-.3+d*2.3;this.body.position.y=2.8,this.torso.rotation.y=f*o,this.lThigh.rotation.x=-.3,this.rThigh.rotation.x=-.15-d*.3,this.lShin.rotation.x=.3,this.rShin.rotation.x=.4+d*.3,this.rArm.rotation.set(-1.5+d*.2,0,(.5-d*1.2)*o),this.lArm.rotation.set(-1.45+d*.1,0,(.9-d*1.4)*o),this.rFore.rotation.x=-1.2+d*.9,this.lFore.rotation.x=-1.4+d*1,this.bat&&this.bat.rotation.set(1.2+d*.4,0,(-.8-d*2.4)*o);break}case"pitch":{const d=Math.min(1,e);if(d<.45){const f=d/.45,g=r?this.rThigh:this.lThigh,v=r?this.rShin:this.lShin;g.rotation.x=-1.5*f,v.rotation.x=1.3*f,this.torso.rotation.y=-.6*f*o,l.rotation.x=-.9*f,u.rotation.x=-.9*f,c.rotation.x=-1*f,h.rotation.x=-1*f}else if(d<.78){const f=(d-.45)/.33,g=r?this.rThigh:this.lThigh,v=r?this.rShin:this.lShin,m=r?this.lThigh:this.rThigh;g.rotation.x=-1.5+f*.7,v.rotation.x=1.3-f*.9,m.rotation.x=f*.5,this.body.position.y=3.05-f*.5,this.torso.rotation.y=(-.6+f*.2)*o,l.rotation.set(.6*f,0,1.4*f*o),c.rotation.x=-1.6*f,u.rotation.set(-1.4*f,0,-.2*o)}else{const f=Math.min(1,(d-.78)/.22),g=r?this.rThigh:this.lThigh,v=r?this.lThigh:this.rThigh;g.rotation.x=-.8+f*.2,v.rotation.x=.5+f*.5,(r?this.lShin:this.rShin).rotation.x=f*1,this.body.position.y=2.55,this.body.rotation.x=.2+f*.55,this.torso.rotation.y=(-.4+f*1.3)*o,l.rotation.set(.6-f*3,0,(1.4-f*1.2)*o),c.rotation.x=-1.6+f*1.4,u.rotation.set(-1.4+f*1,0,0)}break}case"throw":{const d=Math.min(1,e),f=d<.4?d/.4:1,g=d<.4?0:(d-.4)/.6;this.torso.rotation.y=(-.7*f+1.4*g)*o,l.rotation.set(.8*f-3*g,0,1.3*o*(1-g)),c.rotation.x=-1.4*f+1.2*g,u.rotation.x=-1.2*f+g,this.body.rotation.x=.35*g,this.lThigh.rotation.x=-.4*f,this.rThigh.rotation.x=.3*f;break}case"catch":{this.body.position.y=2.85,u.rotation.set(-1.9,0,-.2*o),h.rotation.x=-.3,l.rotation.x=-1.4,c.rotation.x=-.8;break}case"dive":{const d=Math.min(1,e);this.body.rotation.x=.4+d*1.15,this.body.position.y=3.05-d*2.2,this.root.position.y=Math.sin(d*Math.PI)*.8,u.rotation.x=-2.9,l.rotation.x=-2.6,this.lThigh.rotation.x=.3,this.rThigh.rotation.x=.5;break}case"down":{this.body.rotation.x=1.5,this.body.position.y=.6,u.rotation.x=-2.9,l.rotation.x=-2.4;break}case"jump":{const d=Math.min(1,e);this.root.position.y=Math.sin(d*Math.PI)*3.2,u.rotation.set(-3,0,-.2*o),l.rotation.x=-.6,this.lThigh.rotation.x=-.3,this.lShin.rotation.x=.6;break}case"slide":{this.body.rotation.x=-1.25,this.body.position.y=.9,this.lThigh.rotation.x=-1.3,this.rThigh.rotation.x=-1,this.rShin.rotation.x=1.2,this.lArm.rotation.x=-2.6,this.rArm.rotation.x=-2.2;break}case"celebrate":{const d=Math.abs(Math.sin(a*6));this.root.position.y=d*1.2,this.lArm.rotation.set(-2.8,0,-.3),this.rArm.rotation.set(-2.8,0,.3);break}}}}const Er=["#f1c9a5","#e0ac85","#c68b62","#a8704a","#8a5636","#6b4027","#f5d3b8"],$a=i=>{let t=0;for(let e=0;e<i.length;e++)t=t*31+i.charCodeAt(e)|0;return Math.abs(t)};class YS{constructor(t){I(this,"renderer");I(this,"scene",new op);I(this,"camMgr");I(this,"stadium",null);I(this,"stadiumGroup",null);I(this,"models",new Map);I(this,"teams",null);I(this,"ball");I(this,"ballShadow");I(this,"trail");I(this,"trailPts",[]);I(this,"landing");I(this,"pci");I(this,"zone");I(this,"target");I(this,"rain",null);I(this,"fw",[]);I(this,"lastBoard","");I(this,"clock",0);I(this,"dummy",new Se);I(this,"container");this.container=t,this.renderer=new OS({antialias:!0,powerPreference:"high-performance"});const e="ontouchstart"in window&&Math.min(screen.width,screen.height)<900;this.renderer.setPixelRatio(Math.min(e?1.5:2,window.devicePixelRatio)),this.renderer.shadowMap.enabled=!0,this.renderer.shadowMap.type=Mh,this.renderer.toneMapping=Rh,this.renderer.toneMappingExposure=1,this.renderer.outputColorSpace=Me,t.appendChild(this.renderer.domElement),this.camMgr=new $S(1),this.resize(),window.addEventListener("resize",()=>this.resize()),this.ball=new Mt(new xn(.121,16,12),new ge({color:"#ffffff",emissive:"#444444",roughness:.4})),this.ball.castShadow=!0,this.scene.add(this.ball),this.ballShadow=new Mt(new gi(.35,16),new ke({color:"#000",transparent:!0,opacity:.4,depthWrite:!1})),this.ballShadow.rotation.x=-Math.PI/2,this.scene.add(this.ballShadow),this.trail=new dp(new xn(.12,8,6),new ke({color:"#ffffff",transparent:!0,opacity:.55,depthWrite:!1}),40),this.trail.instanceColor=new Vo(new Float32Array(120),3),this.trail.frustumCulled=!1,this.scene.add(this.trail),this.landing=new ve;const n=new Mt(new fi(.86,1,48),new ke({color:"#ffe14d",transparent:!0,opacity:.9,depthWrite:!1}));n.rotation.x=-Math.PI/2;const s=new Mt(new gi(.12,16),new ke({color:"#ffe14d",transparent:!0,opacity:.9,depthWrite:!1}));s.rotation.x=-Math.PI/2,this.landing.add(n,s),this.landing.position.y=.15,this.scene.add(this.landing),this.pci=new ve;const r=new ke({color:"#ffffff",transparent:!0,opacity:.9,depthTest:!1,depthWrite:!1}),a=new Mt(new fi(.9,1,48),r),o=new Mt(new fi(0,.16,24),r),l=new Mt(new on(.06,2.6),r),c=new Mt(new on(2.6,.06),r);this.pci.add(a,o,l,c),this.pci.traverse(T=>T.renderOrder=20),this.scene.add(this.pci),this.zone=new ve;const u=new Wo({color:"#ffffff",transparent:!0,opacity:.55,depthTest:!1}),h=.708,d=1.55,f=3.45,g=[],v=(T,C)=>g.push(...T,...C);v([-h,d,0],[h,d,0]),v([h,d,0],[h,f,0]),v([h,f,0],[-h,f,0]),v([-h,f,0],[-h,d,0]);const m=new fe;m.setAttribute("position",new qt(g,3));const p=new dc(m,u);p.renderOrder=19;const M=[];for(let T=1;T<3;T++){const C=-h+2*h*T/3,A=d+(f-d)*T/3;M.push(C,d,0,C,f,0,-h,A,0,h,A,0)}const b=new fe;b.setAttribute("position",new qt(M,3));const x=new dc(b,new Wo({color:"#ffffff",transparent:!0,opacity:.18,depthTest:!1}));x.renderOrder=19,this.zone.add(p,x),this.zone.position.z=-ws,this.scene.add(this.zone),this.target=new ve;const E=new ke({color:"#ffffff",transparent:!0,opacity:.95,depthTest:!1,depthWrite:!1});this.target.add(new Mt(new fi(.17,.22,32),E)),this.target.add(new Mt(new on(.03,.55),E)),this.target.add(new Mt(new on(.55,.03),E)),this.target.traverse(T=>T.renderOrder=21),this.target.position.z=-ws,this.scene.add(this.target)}resize(){const t=this.container.clientWidth||window.innerWidth,e=this.container.clientHeight||window.innerHeight;this.renderer.setSize(t,e),this.camMgr.cam.aspect=t/e,this.camMgr.cam.updateProjectionMatrix()}loadGame(t){this.stadiumGroup&&(this.scene.remove(this.stadiumGroup),this.stadiumGroup.traverse(r=>{const a=r;a.geometry&&a.geometry.dispose()}));for(const r of this.models.values())this.scene.remove(r.root);this.models.clear();const e=Vi[t.stadiumId],n=Ze[t.homeId];this.teams={home:n,away:Ze[t.awayId]},this.stadium=VS(e,n,t.conditions),this.stadiumGroup=this.stadium.group,this.scene.add(this.stadiumGroup);const s=this.stadium.skyColor;if(this.scene.fog=new cl(s.clone().lerp(new Nt("#ffffff"),.2),700,2400),this.renderer.toneMappingExposure=t.conditions.time==="Night"?1.1:1,this.rain&&(this.scene.remove(this.rain),this.rain=null),t.conditions.weather==="Light Rain"){const a=new Float32Array(12e3);for(let l=0;l<4e3;l++)a[l*3]=(Math.random()-.5)*200,a[l*3+1]=Math.random()*120,a[l*3+2]=(Math.random()-.5)*200;const o=new fe;o.setAttribute("position",new We(a,3)),this.rain=new pc(o,new $o({color:"#cfe3ff",size:.35,transparent:!0,opacity:.55,depthWrite:!1})),this.rain.frustumCulled=!1,this.scene.add(this.rain)}this.lastBoard=""}uniformFor(t){if(t.side==="ump")return{jersey:"#1c2533",pants:"#5d636b",trim:"#1c2533",cap:"#111",number:"#fff",skin:Er[$a(t.id)%Er.length],helmet:!1,catcherGear:!1,umpire:!0};const e=this.teams[t.side],n=t.side==="home",s=e.colors.primary,a=(o=>{const l=new Nt(o);return l.r+l.g+l.b>2.2})(s)?e.colors.secondary:s;return{jersey:n?"#f4f3ee":"#a9afb7",pants:n?"#efeee8":"#a3a9b1",trim:a,cap:a,number:a,skin:Er[$a(t.id)%Er.length],helmet:t.kind==="batter"||t.kind==="runner",catcherGear:t.pos==="C",umpire:!1}}modelFor(t){const e=`${t.id}:${t.kind}:${t.side}:${t.pos==="C"?"C":""}`;let n=this.models.get(e);return n||(n=new qS(this.uniformFor(t),t.number,t.throws==="L",t.kind==="batter"),this.models.set(e,n),this.scene.add(n.root)),n}shake(t){this.camMgr.shake(t)}fireworks(t){if(!this.stadium)return;const e=this.stadium.fireworksOrigin;for(let n=0;n<4;n++){const r=new Float32Array(420),a=new Float32Array(420),o=new B(e.x+(Math.random()-.5)*120,e.y+Math.random()*40,e.z+(Math.random()-.5)*60);for(let u=0;u<140;u++){r.set([o.x,o.y,o.z],u*3);const h=new B().randomDirection().multiplyScalar(25+Math.random()*15);a.set([h.x,h.y,h.z],u*3)}const l=new fe;l.setAttribute("position",new We(r,3));const c=new pc(l,new $o({color:t[n%t.length],size:3,transparent:!0,opacity:1,depthWrite:!1,blending:Qa}));c.frustumCulled=!1,this.scene.add(c),this.fw.push({pts:c,vel:a,life:2.2+n*.3})}}updateScoreboard(t){if(!this.stadium)return;const e=JSON.stringify(t);e!==this.lastBoard&&(this.lastBoard=e,WS(this.stadium.scoreboard,t))}planePoint(t,e,n){const s=this.renderer.domElement.getBoundingClientRect(),r=new ft((t-s.left)/s.width*2-1,-((e-s.top)/s.height)*2+1),a=new em;a.setFromCamera(r,this.camMgr.cam);const o=new kn(new B(0,0,1),n),l=new B;return a.ray.intersectPlane(o,l)?{x:l.x,y:l.y}:null}frame(t,e,n){if(this.clock+=n,t)this.drawSnapshot(t,e,n);else{for(const s of this.models.values())s.root.visible=!1;this.ball.visible=!1,this.ballShadow.visible=!1,this.trail.count=0,this.landing.visible=!1}if(e.pci?(this.pci.visible=!0,this.pci.position.set(e.pci.x,e.pci.y,-Ji),this.pci.scale.setScalar(e.pci.r),this.pci.traverse(s=>{const r=s.material;r!=null&&r.color&&r.color.set(e.pci.color)})):this.pci.visible=!1,this.zone.visible=e.zone,e.target?(this.target.visible=!0,this.target.position.set(e.target.x,e.target.y,-ws),this.target.traverse(s=>{const r=s.material;r!=null&&r.color&&r.color.set(e.target.color)})):this.target.visible=!1,this.rain){const s=this.rain.geometry.attributes.position,r=this.camMgr.cam.position;for(let a=0;a<s.count;a++){let o=s.getY(a)-70*n;o<0&&(o+=120),s.setY(a,o)}s.needsUpdate=!0,this.rain.position.set(r.x,0,r.z)}for(const s of this.fw){s.life-=n;const r=s.pts.geometry.attributes.position;for(let a=0;a<r.count;a++)s.vel[a*3+1]-=18*n,r.setXYZ(a,r.getX(a)+s.vel[a*3]*n,r.getY(a)+s.vel[a*3+1]*n,r.getZ(a)+s.vel[a*3+2]*n);r.needsUpdate=!0,s.pts.material.opacity=Math.max(0,Math.min(1,s.life)),s.life<=0&&(this.scene.remove(s.pts),s.pts.geometry.dispose())}this.fw=this.fw.filter(s=>s.life>0),this.camMgr.update(n,{ball:t?t.ball:{x:0,y:0,z:0,visible:!1},focus:e.focus,batterLefty:!1}),this.renderer.render(this.scene,this.camMgr.cam)}drawSnapshot(t,e,n){const s=new Set;for(const l of t.actors){if(l.kind==="umpire"&&e.mode==="batting")continue;const c=this.modelFor(l);s.add(c),c.root.visible=!0,c.root.position.set(l.x,l.y,-l.z),c.root.rotation.y=Math.PI-l.facing;const u=l.kind==="batter"?l.bats==="L":l.throws==="L";c.animate(l.anim,l.animT,l.speed,n,u,this.clock+$a(l.id)%100/10),c.ring.visible=l.controlled||!!l.selected,c.ring.visible&&(c.ring.material.color.set(l.controlled?"#3fa9ff":"#ffd34d"),c.ring.scale.setScalar(1+Math.sin(this.clock*6)*.08)),c.setOpacity(e.dimCatcher&&l.pos==="C"?.35:1)}for(const l of this.models.values())s.has(l)||(l.root.visible=!1);const r=t.ball;if(this.ball.visible=r.visible,this.ballShadow.visible=r.visible&&r.y<200,r.visible){this.ball.position.copy(Gt(r.x,r.y,r.z));const l=e.mode==="batting"||e.mode==="pitching"?1.25:2.4;this.ball.scale.setScalar(l),this.ball.material.emissive.set(e.mode==="batting"?"#777":"#555"),this.ballShadow.position.copy(Gt(r.x,.12,r.z)),this.ballShadow.scale.setScalar(Math.max(.6,1.6-r.y/60)*(l/1.3)),this.ballShadow.material.opacity=Math.max(.12,.45-r.y/150)}r.visible&&r.trail?(this.trailPts.unshift(this.ball.position.clone()),this.trailPts.length>40&&this.trailPts.pop()):this.trailPts.length&&this.trailPts.splice(Math.max(0,this.trailPts.length-3));const a=new Nt(r.color),o=this.trailPts.length;for(let l=0;l<o;l++){const c=(1-l/o)*this.ball.scale.x*.95;this.dummy.position.copy(this.trailPts[l]),this.dummy.scale.setScalar(c),this.dummy.updateMatrix(),this.trail.setMatrixAt(l,this.dummy.matrix),this.trail.setColorAt(l,a.clone().multiplyScalar(1-l/o*.6))}if(this.trail.count=o,this.trail.instanceMatrix.needsUpdate=!0,this.trail.instanceColor&&(this.trail.instanceColor.needsUpdate=!0),t.landing){this.landing.visible=!0,this.landing.position.set(t.landing.x,.15,-t.landing.z);const l=t.landing.r;this.landing.children[0].scale.setScalar(l)}else this.landing.visible=!1}}class JS{constructor(t){I(this,"keys",new Set);I(this,"pressed",new Set);I(this,"released",new Set);I(this,"mouse",{x:0,y:0,moved:!1,buttons:0});I(this,"clicks",[]);I(this,"pci",{x:0,y:Ki});I(this,"aim",{x:0,y:Ki});I(this,"throwHold",null);I(this,"runnerSel",null);I(this,"enabled",!0);I(this,"gpPrev",[]);I(this,"stick",{x:0,y:0});I(this,"drag",null);window.addEventListener("keydown",e=>{const n=eh(e);["Space","ArrowUp","ArrowDown","ArrowLeft","ArrowRight","Tab"].includes(n)&&this.enabled&&e.preventDefault(),this.keys.has(n)||this.pressed.add(n),this.keys.add(n)}),window.addEventListener("keyup",e=>{const n=eh(e);this.keys.delete(n),this.released.add(n)}),window.addEventListener("blur",()=>{this.keys.clear(),this.throwHold=null}),t.addEventListener("mousemove",e=>{this.mouse.x=e.clientX,this.mouse.y=e.clientY,this.mouse.moved=!0}),t.addEventListener("mousedown",e=>{this.mouse.x=e.clientX,this.mouse.y=e.clientY,this.clicks.push(e.button)}),t.addEventListener("contextmenu",e=>e.preventDefault())}virtualDown(t){this.keys.has(t)||this.pressed.add(t),this.keys.add(t)}virtualUp(t){this.keys.delete(t),this.released.add(t)}touchDrag(t,e,n,s){this.drag?(this.drag.x1=n,this.drag.y1=s):this.drag={x0:t,y0:e,x1:n,y1:s}}hit(t){return this.pressed.has(t)}endFrame(){this.pressed.clear(),this.released.clear(),this.clicks=[],this.mouse.moved=!1,this.drag=null}build(t,e){const n=_h(),s=this.keys,r=this.readGamepad();if(this.mouse.moved){const c=e.planePoint(this.mouse.x,this.mouse.y,e.userPitching?e.aimPlaneZ:e.pciPlaneZ);c&&(e.userPitching?this.aim={x:Xt(c.x,-2.2,2.2),y:Xt(c.y,.4,4.8)}:this.pci={x:Xt(c.x,-1.6,1.6),y:Xt(c.y,.9,4.3)})}if(this.drag){const c=e.userPitching?e.aimPlaneZ:e.pciPlaneZ,u=e.planePoint(this.drag.x0,this.drag.y0,c),h=e.planePoint(this.drag.x1,this.drag.y1,c);if(u&&h){const d=e.userPitching?this.aim:this.pci,f=.9;d.x=Xt(d.x+(h.x-u.x)*f,-2.2,2.2),d.y=Xt(d.y+(h.y-u.y)*f,.4,4.8)}}const a=(s.has("ArrowRight")?1:0)-(s.has("ArrowLeft")?1:0)+r.lx,o=(s.has("ArrowUp")?1:0)-(s.has("ArrowDown")?1:0)-r.ly;if(a||o){const c=e.userPitching?this.aim:this.pci;c.x=Xt(c.x+a*3.2*t,-2.2,2.2),c.y=Xt(c.y+o*3.2*t,.4,4.8)}if(n.pci={...this.pci},n.aim={...this.aim},this.hit("Space")||this.clicks.includes(0)||this.clicks.includes(2)||r.a){let c="normal";(s.has("Shift")||this.clicks.includes(2)||r.rt)&&(c="power"),(s.has("Control")||s.has("Alt")||r.lt)&&(c="contact"),n.swing=c}if(e.repertoire.forEach((c,u)=>{this.hit("Key"+Ya[u])&&(n.pitchSelect=c)}),r.pitchIdx>=0&&r.pitchIdx<e.repertoire.length&&(n.pitchSelect=e.repertoire[r.pitchIdx]),n.meterPress=this.hit("Space")||this.clicks.includes(0)||r.a,e.liveDefense){const c=e.cameraAxes(),u=(s.has("KeyW")?1:0)-(s.has("KeyS")?1:0)-r.ly,h=(s.has("KeyD")?1:0)-(s.has("KeyA")?1:0)+r.lx;let d=c.fwd.x*u+c.right.x*h,f=c.fwd.z*u+c.right.z*h;const g=Math.hypot(d,f);g>1&&(d/=g,f/=g),n.defense.move={x:d,z:f},n.defense.sprint=s.has("Shift")||r.rt,n.defense.dive=this.hit("Space")||r.a;for(let v=1;v<=4;v++){const m="Digit"+v;this.hit(m)&&!this.throwHold&&(this.throwHold={base:v,t:0})}if(r.throwBase&&!this.throwHold&&(this.throwHold={base:r.throwBase,t:0}),this.throwHold){this.throwHold.t+=t;const v=this.throwHold.t/e.throwFill;(!(s.has("Digit"+this.throwHold.base)||r.throwHeld===this.throwHold.base)||v>=1.2)&&(n.defense.throwTo=this.throwHold.base,n.defense.throwMeter=Math.min(1.2,v),this.throwHold=null)}}else this.throwHold=null;if(e.userBatting){for(let c=1;c<=4;c++)this.hit("Digit"+c)&&(this.runnerSel=c===4?0:c);(this.hit("Backquote")||this.hit("Digit0"))&&(this.runnerSel=null),(this.hit("KeyQ")||r.rb)&&(n.runnerCmd={dir:1,sel:this.runnerSel}),(this.hit("KeyE")||r.lb)&&(n.runnerCmd={dir:-1,sel:this.runnerSel})}return n.skip=this.hit("Space")||this.hit("Enter")||r.a,n}readGamepad(){const t={lx:0,ly:0,a:!1,rt:!1,lt:!1,rb:!1,lb:!1,pitchIdx:-1,throwBase:0,throwHeld:0},e=navigator.getGamepads?navigator.getGamepads():[],n=e&&Array.from(e).find(l=>l);if(t.lx=this.stick.x,t.ly=this.stick.y,!n)return t;const s=l=>Math.abs(l)<.18?0:l;t.lx+=s(n.axes[0]??0),t.ly+=s(n.axes[1]??0);const r=l=>{var c;return!!((c=n.buttons[l])!=null&&c.pressed)},a=l=>r(l)&&!this.gpPrev[l];t.a=a(0),t.rt=r(7),t.lt=r(6),t.rb=a(5),t.lb=a(4),a(2)&&(t.pitchIdx=0),a(3)&&(t.pitchIdx=1),a(1)&&(t.pitchIdx=2),a(12)&&(t.pitchIdx=3),a(13)&&(t.pitchIdx=4);const o=[[15,1],[12,2],[14,3],[13,4]];for(const[l,c]of o)a(l)&&(t.throwBase=c),r(l)&&(t.throwHeld=c);return this.gpPrev=n.buttons.map(l=>l.pressed),t}}function eh(i){return i.key==="Shift"?"Shift":i.key==="Control"||i.key==="Meta"?"Control":i.key==="Alt"?"Alt":i.key==="Escape"?"Escape":i.key==="Enter"?"Enter":i.code}const KS=()=>"ontouchstart"in window||navigator.maxTouchPoints>0;class ZS{constructor(t,e,n){I(this,"el");I(this,"groups",new Map);I(this,"mode","none");I(this,"stickId",null);I(this,"stickOrigin",{x:0,y:0});I(this,"knob");I(this,"dragId",null);I(this,"dragLast",{x:0,y:0});I(this,"onPause",()=>{});I(this,"onReplayDrag",()=>{});I(this,"onReplayPinch",()=>{});I(this,"onAnyTouch",()=>{});I(this,"pinch",0);this.ctrl=n,this.el=document.createElement("div"),this.el.className="touch",this.el.innerHTML=`
      <div class="tc-top"><button class="tbtn sm" data-k="Escape">❚❚</button><button class="tbtn sm" data-g="replaybtn" data-k="KeyR">R</button></div>
      <div class="tc-group" data-g="bat">
        <button class="tbtn big" data-k="Space">SWING</button>
        <button class="tbtn mid power" data-combo="Shift+Space">POWER</button>
        <button class="tbtn mid contact" data-combo="Control+Space">CONTACT</button>
        <div class="tc-hint">Drag anywhere to move the PCI</div>
      </div>
      <div class="tc-group" data-g="steal"><button class="tbtn mid" data-k="KeyQ">STEAL</button></div>
      <div class="tc-group" data-g="pitch">
        <button class="tbtn big" data-k="Space">PITCH</button>
        <div class="tc-hint">Tap a pitch · drag to aim · PITCH starts the meter, tap again on the gold line</div>
      </div>
      <div class="tc-group" data-g="field">
        <div class="tc-stick"><div class="tc-knob"></div></div>
        <div class="tc-throws">
          <button class="tbtn mid" data-k="Digit2">2B</button>
          <div><button class="tbtn mid" data-k="Digit3">3B</button><button class="tbtn mid" data-k="Digit1">1B</button></div>
          <button class="tbtn mid" data-k="Digit4">HOME</button>
        </div>
        <div class="tc-actions"><button class="tbtn mid" data-k="Shift">SPRINT</button><button class="tbtn mid" data-k="Space">DIVE</button></div>
      </div>
      <div class="tc-group" data-g="run">
        <div class="tc-sel"><button class="tbtn sm" data-k="Digit0">ALL</button><button class="tbtn sm" data-k="Digit1">1st</button><button class="tbtn sm" data-k="Digit2">2nd</button><button class="tbtn sm" data-k="Digit3">3rd</button><button class="tbtn sm" data-k="Digit4">BR</button></div>
        <div class="tc-actions"><button class="tbtn mid" data-k="KeyE">◀ BACK</button><button class="tbtn mid" data-k="KeyQ">GO ▶</button></div>
      </div>
      <div class="tc-group" data-g="wait"><button class="tbtn big" data-k="Space">▶</button></div>
      <div class="tc-group" data-g="replay">
        <div class="tc-actions"><button class="tbtn mid" data-k="Space">❚❚/▶</button><button class="tbtn mid" data-k="KeyZ">SLOW</button><button class="tbtn mid" data-k="ArrowLeft">◀◀</button><button class="tbtn mid" data-k="ArrowRight">▶▶</button><button class="tbtn mid" data-k="KeyR">EXIT</button></div>
        <div class="tc-hint">Drag to rotate · pinch to zoom</div>
      </div>
      <div class="tc-rotate">↻ Turn your phone sideways for the best view</div>`,t.appendChild(this.el),this.el.querySelectorAll("[data-g]").forEach(a=>this.groups.set(a.dataset.g,a)),this.knob=this.el.querySelector(".tc-knob"),this.el.querySelectorAll("button").forEach(a=>{const o=a.dataset.combo?a.dataset.combo.split("+"):[a.dataset.k],l=u=>{if(u.preventDefault(),this.onAnyTouch(),a.classList.add("on"),o[0]==="Escape"){this.onPause();return}for(const h of o)this.ctrl.virtualDown(h)},c=u=>{u.preventDefault(),a.classList.remove("on");for(const h of o)this.ctrl.virtualUp(h)};a.addEventListener("touchstart",l,{passive:!1}),a.addEventListener("touchend",c,{passive:!1}),a.addEventListener("touchcancel",c,{passive:!1}),a.addEventListener("mousedown",l),a.addEventListener("mouseup",c),a.addEventListener("mouseleave",u=>{a.classList.contains("on")&&c(u)})});const s=this.el.querySelector(".tc-stick");s.addEventListener("touchstart",a=>{a.preventDefault();const o=a.changedTouches[0];this.stickId=o.identifier;const l=s.getBoundingClientRect();this.stickOrigin={x:l.left+l.width/2,y:l.top+l.height/2},this.moveStick(o.clientX,o.clientY)},{passive:!1}),window.addEventListener("touchmove",a=>{for(const o of Array.from(a.changedTouches))o.identifier===this.stickId&&this.moveStick(o.clientX,o.clientY),o.identifier===this.dragId&&(this.mode==="replay"?this.onReplayDrag(o.clientX-this.dragLast.x,o.clientY-this.dragLast.y):this.ctrl.touchDrag(this.dragLast.x,this.dragLast.y,o.clientX,o.clientY),this.dragLast={x:o.clientX,y:o.clientY});if(this.mode==="replay"&&a.touches.length===2){const[o,l]=[a.touches[0],a.touches[1]],c=Math.hypot(o.clientX-l.clientX,o.clientY-l.clientY);this.pinch&&this.onReplayPinch(this.pinch/c),this.pinch=c}},{passive:!0});const r=a=>{for(const o of Array.from(a.changedTouches))o.identifier===this.stickId&&(this.stickId=null,this.ctrl.stick={x:0,y:0},this.knob.style.transform=""),o.identifier===this.dragId&&(this.dragId=null);a.touches.length<2&&(this.pinch=0)};window.addEventListener("touchend",r),window.addEventListener("touchcancel",r),e.style.touchAction="none",e.addEventListener("touchstart",a=>{a.preventDefault(),this.onAnyTouch();const o=a.changedTouches[0];this.dragId===null&&(this.dragId=o.identifier,this.dragLast={x:o.clientX,y:o.clientY})},{passive:!1})}moveStick(t,e){let s=t-this.stickOrigin.x,r=e-this.stickOrigin.y;const a=Math.hypot(s,r);a>46&&(s*=46/a,r*=46/a),this.knob.style.transform=`translate(${s}px, ${r}px)`,this.ctrl.stick={x:s/46,y:r/46}}setMode(t,e={}){t!==this.mode&&(this.mode=t,this.ctrl.stick={x:0,y:0},this.knob.style.transform="");const n=(s,r)=>{const a=this.groups.get(s);a&&(a.style.display=r?"":"none")};n("bat",t==="bat"),n("steal",t==="bat"&&!!e.steal),n("pitch",t==="pitch"),n("field",t==="field"),n("run",t==="run"),n("wait",t==="wait"),n("replay",t==="replay"),n("replaybtn",!!e.replay),this.el.style.display=t==="none"?"none":""}}const jS=["batCrack","batCrackBig","glove","crowdAmbience","crowdCheer","crowdGroan","crowdRoar","strikeCall","ballCall","outCall","safeCall","slide","swing","pitch","organ"];class QS{constructor(){I(this,"ctx",null);I(this,"master",null);I(this,"crowdGain",null);I(this,"buffers",new Map);I(this,"ambience",null);I(this,"noise",null);I(this,"volume",.8);I(this,"crowdVolume",.5);I(this,"voice",!0);I(this,"base","./baseball/audio/")}unlock(){if(this.ctx){this.ctx.resume();return}const t=window.AudioContext||window.webkitAudioContext;if(!t)return;this.ctx=new t,this.master=this.ctx.createGain(),this.master.gain.value=this.volume,this.master.connect(this.ctx.destination),this.crowdGain=this.ctx.createGain(),this.crowdGain.gain.value=this.crowdVolume,this.crowdGain.connect(this.master);const e=this.ctx.sampleRate*2;this.noise=this.ctx.createBuffer(1,e,this.ctx.sampleRate);const n=this.noise.getChannelData(0);for(let s=0;s<e;s++)n[s]=Math.random()*2-1;for(const s of jS)this.tryLoad(s)}async tryLoad(t){if(this.ctx){for(const e of["mp3","ogg","wav"])try{const n=await fetch(`${this.base}${t}.${e}`);if(!n.ok||!(n.headers.get("content-type")??"").match(/audio|octet/))continue;const s=await this.ctx.decodeAudioData(await n.arrayBuffer());this.buffers.set(t,s),t==="crowdAmbience"&&this.ambience&&this.startAmbience();return}catch{}this.buffers.set(t,null)}}setVolume(t,e){this.volume=t,this.crowdVolume=e,this.master&&(this.master.gain.value=t),this.crowdGain&&(this.crowdGain.gain.value=e)}startAmbience(){if(!this.ctx||!this.crowdGain)return;if(this.ambience)try{this.ambience.stop()}catch{}const t=this.ctx.createBufferSource(),e=this.buffers.get("crowdAmbience");t.buffer=e??this.noise,t.loop=!0;let n=t;if(!e){const s=this.ctx.createBiquadFilter();s.type="bandpass",s.frequency.value=900,s.Q.value=.4;const r=this.ctx.createGain();r.gain.value=.12,t.connect(s),s.connect(r),n=r}n.connect(this.crowdGain),t.start(),this.ambience=t}stopAmbience(){if(this.ambience){try{this.ambience.stop()}catch{}this.ambience=null}}play(t,e=1){if(!this.ctx||!this.master)return;const n=this.buffers.get(t),r=t.startsWith("crowd")||t==="organ"?this.crowdGain:this.master;if(n){const a=this.ctx.createBufferSource();a.buffer=n;const o=this.ctx.createGain();o.gain.value=Math.min(1.5,e),a.connect(o),o.connect(r),a.start();return}this.synth(t,e,r),this.voice&&(t==="strikeCall"||t==="outCall"||t==="safeCall"||t==="ballCall")&&this.say(t)}say(t){if(!("speechSynthesis"in window))return;const e={strikeCall:"Strike!",outCall:"He's out!",safeCall:"Safe!",ballCall:"Ball."}[t];if(e)try{const n=new SpeechSynthesisUtterance(e);n.rate=1.15,n.pitch=.7,n.volume=Math.min(1,this.volume),window.speechSynthesis.cancel(),window.speechSynthesis.speak(n)}catch{}}noiseBurst(t,e,n,s,r,a=.002,o=1){const l=this.ctx,c=l.createBufferSource();c.buffer=this.noise;const u=l.createBiquadFilter();u.type=s,u.frequency.value=n,u.Q.value=o;const h=l.createGain(),d=l.currentTime;return h.gain.setValueAtTime(0,d),h.gain.linearRampToValueAtTime(r,d+a),h.gain.exponentialRampToValueAtTime(1e-4,d+e),c.connect(u),u.connect(h),h.connect(t),c.start(d,Math.random()),c.stop(d+e+.05),{f:u,g:h,t:d}}tone(t,e,n,s,r="sine",a=0){const o=this.ctx,l=o.createOscillator();l.type=r;const c=o.currentTime;l.frequency.setValueAtTime(e,c),a&&l.frequency.exponentialRampToValueAtTime(Math.max(20,e+a),c+n);const u=o.createGain();u.gain.setValueAtTime(s,c),u.gain.exponentialRampToValueAtTime(1e-4,c+n),l.connect(u),u.connect(t),l.start(c),l.stop(c+n+.05)}synth(t,e,n){switch(t){case"batCrack":this.noiseBurst(n,.12,2400,"bandpass",.9*e,.001,1.5),this.tone(n,950,.08,.4*e,"triangle",-400);break;case"batCrackBig":this.noiseBurst(n,.22,1800,"bandpass",1.3*e,.001,1.2),this.tone(n,700,.15,.7*e,"square",-350),this.noiseBurst(n,.4,400,"lowpass",.5*e,.001);break;case"glove":this.noiseBurst(n,.07,700,"lowpass",.9*e,.001),this.tone(n,180,.08,.5*e,"sine",-80);break;case"slide":this.noiseBurst(n,.5,1200,"bandpass",.35*e,.05,.6);break;case"swing":{const s=this.noiseBurst(n,.22,600,"bandpass",.25*e,.08,2);s.f.frequency.exponentialRampToValueAtTime(2500,s.t+.2)}break;case"pitch":{const s=this.noiseBurst(n,.3,500,"bandpass",.12*e,.1,3);s.f.frequency.exponentialRampToValueAtTime(1800,s.t+.28)}break;case"strikeCall":case"outCall":this.tone(n,220,.25,.25,"sawtooth",-60);break;case"safeCall":this.tone(n,300,.2,.2,"sawtooth",80);break;case"ballCall":break;case"crowdCheer":this.noiseBurst(n,2.2*e,1100,"bandpass",.55*e,.25,.5);break;case"crowdGroan":{const s=this.noiseBurst(n,1.4,350,"lowpass",.5*e,.15);s.f.frequency.exponentialRampToValueAtTime(180,s.t+1.2)}break;case"crowdRoar":this.noiseBurst(n,5.5,1e3,"bandpass",1,.6,.4),this.noiseBurst(n,4,2400,"bandpass",.35,.8,.8);break;case"organ":[392,523,659,784].forEach((s,r)=>setTimeout(()=>this.ctx&&this.tone(n,s,.35,.18,"square"),r*160));break}}}const Ke=i=>i.replace(/[&<>"]/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"})[t]);class tx{constructor(t){I(this,"el");I(this,"regions",new Map);I(this,"bannerTimer",0);I(this,"toastTimer",0);I(this,"feedbackTimer",0);I(this,"lower3Timer",0);this.el=document.createElement("div"),this.el.className="hud",t.appendChild(this.el);for(const e of["bug","linescore","batter","pitcher","pitchinfo","pitchpanel","meter","feedback","banner","lower3","toast","hint","runners","throwhint","replay"]){const n=document.createElement("div");n.dataset.r=e,this.el.appendChild(n),this.regions.set(e,{el:n,html:""})}}destroy(){this.el.remove()}set(t,e){const n=this.regions.get(t);n.html!==e&&(n.html=e,n.el.innerHTML=e)}banner(t,e="",n="",s=2.2,r=""){this.set("banner",`<div class="banner"><div class="big ${n}">${Ke(t)}</div>${e?`<div class="sub">${Ke(e)}</div>`:""}${r}</div>`),this.bannerTimer=s}homeRun(t,e,n,s){this.banner("HOME RUN",t,"gold",4.2,`<div class="stats3"><div>${e.toFixed(1)}<small>MPH EXIT VELO</small></div><div>${Math.round(n)}°<small>LAUNCH ANGLE</small></div><div>${Math.round(s)}<small>FEET</small></div></div>`)}toast(t,e="",n=2.6){this.set("toast",`<div class="toast">${Ke(t)}${e?`<small>${Ke(e)}</small>`:""}</div>`),this.toastTimer=n}feedback(t,e,n,s,r){const a=t.replace(/[^A-Z-]/g,"");this.set("feedback",`<div class="feedback"><div class="t">${Ke(e)}</div><div class="c-${a}">${Ke(t)}</div>${n&&s?`<div class="ev">${s.toFixed(1)} mph · ${Math.round(r??0)}°</div>`:""}</div>`),this.feedbackTimer=1.6}batterCard(t,e){const n=ja(e),s=t.stats.b(e.id),r=Fe(t.state),a=r.lineup.find(l=>l.player.id===e.id),o=s.PA?`${s.H}-${s.AB}${s.HR?`, ${s.HR} HR`:""}${s.RBI?`, ${s.RBI} RBI`:""}${s.BB?`, ${s.BB} BB`:""}`:"First at-bat";this.set("lower3",`<div class="lower3" style="border-top:3px solid ${r.team.colors.primary}"><div class="num" style="background:${r.team.colors.primary}">${e.number}</div>
      <div class="info"><div class="nm">${Ke(e.name.toUpperCase())}</div><div class="ps">${(a==null?void 0:a.pos)??e.pos} · Bats ${e.bats} · ${Ke(o)}</div></div>
      <div class="st"><div>${n.avg}<small>AVG</small></div><div>${n.hr}<small>HR</small></div><div>${n.rbi}<small>RBI</small></div></div></div>`),this.lower3Timer=3.2}pitcherCard(t,e){const n=xh(e),s=Te(t.state);this.set("lower3",`<div class="lower3" style="border-top:3px solid ${s.team.colors.primary}"><div class="num" style="background:${s.team.colors.primary}">${e.number}</div>
      <div class="info"><div class="nm">${Ke(e.name.toUpperCase())}</div><div class="ps">PITCHING CHANGE · ${e.throws}HP · ${e.pitcher.pitches.map(r=>ye[r].short).join(" ")}</div></div>
      <div class="st"><div>${n.era}<small>ERA</small></div><div>${n.w}-${n.l}<small>W-L</small></div><div>${n.so}<small>SO</small></div><div>${n.whip}<small>WHIP</small></div></div></div>`),this.lower3Timer=3.5}tick(t){this.bannerTimer>0&&(this.bannerTimer-=t)<=0&&this.set("banner",""),this.toastTimer>0&&(this.toastTimer-=t)<=0&&this.set("toast",""),this.feedbackTimer>0&&(this.feedbackTimer-=t)<=0&&this.set("feedback",""),this.lower3Timer>0&&(this.lower3Timer-=t)<=0&&this.set("lower3","")}hideLower3(){this.set("lower3",""),this.lower3Timer=0}clearTransient(){for(const t of["banner","toast","feedback","lower3"])this.set(t,"")}update(t,e){const n=t.state,s=n.away,r=n.home,a=Fe(n),o=n.bases.map(A=>!!A),l=t.phase==="live"&&t.play;let c=o;if(l){c=[!1,!1,!1];for(const A of t.play.activeRunners())if(_n(A)){const _=Math.round(A.p/90);_>=1&&_<=3&&(c[_-1]=!0)}}const u=l?Math.min(3,n.outs+t.play.outs.length):n.outs,h=(A,_)=>`<div class="trow ${_?"bat":""}"><div class="chip" style="background:${A.team.colors.primary}"></div><div class="ab">${A.team.id}</div><div class="sc">${A.runs}</div></div>`;this.set("bug",`<div class="bug"><div class="teams">${h(s,a===s)}${h(r,a===r)}</div>
      <div class="mid"><div class="inn"><span class="arr">${n.half==="top"?"▲":"▼"}</span>${n.inning}</div>
        <div class="diamond"><i style="left:15px;top:1px" class="${c[1]?"on":""}"></i><i style="left:2px;top:14px" class="${c[2]?"on":""}"></i><i style="left:28px;top:14px" class="${c[0]?"on":""}"></i></div></div>
      <div class="count"><div>${n.balls}-${n.strikes}</div><div class="outs">${[0,1,2].map(A=>`<i class="${A<u?"on":""}"></i>`).join("")}</div></div></div>`);const d=Math.max(n.settings.innings,s.linescore.length,r.linescore.length,n.inning),f=(A,_,y)=>{const L=A.linescore[_],U=n.inning===_+1&&n.half==="top"===y&&!n.over;return`<td class="${U?"cur":""}">${L===void 0?U?0:"":L}</td>`};this.set("linescore",`<div class="linescore"><table><tr><th></th>${Array.from({length:d},(A,_)=>`<th>${_+1}</th>`).join("")}<th>R</th><th>H</th><th>E</th></tr>
      <tr><td class="t">${s.team.id}</td>${Array.from({length:d},(A,_)=>f(s,_,!0)).join("")}<td class="rhe">${s.runs}</td><td class="rhe">${s.hits}</td><td class="rhe">${s.errors}</td></tr>
      <tr><td class="t">${r.team.id}</td>${Array.from({length:d},(A,_)=>f(r,_,!1)).join("")}<td class="rhe">${r.runs}</td><td class="rhe">${r.hits}</td><td class="rhe">${r.errors}</td></tr></table></div>`);const g=ze(n),v=Ve(n),m=t.stats.b(g.id),p=ja(g),M=a.lineup.find(A=>A.player.id===g.id);this.set("batter",`<div class="card left" style="border-top-color:${a.team.colors.primary}"><div class="nm">${Ke(g.name)} <span style="font-size:15px;color:var(--muted)">#${g.number}</span></div>
      <div class="sub">${(M==null?void 0:M.pos)??g.pos} · Bats ${g.bats} · ${m.PA?`${m.H}-${m.AB} today`:"first PA"}</div>
      <div class="stats">AVG<b>${p.avg}</b> HR<b>${p.hr}</b> RBI<b>${p.rbi}</b></div></div>`);const b=Te(n),x=t.stats.p(v.id),E=Math.min(1,Fs(b)),T=b.pitchCounts.get(v.id)??0;if(this.set("pitcher",`<div class="card right" style="border-top-color:${b.team.colors.primary}"><div class="nm">${Ke(v.name)} <span style="font-size:15px;color:var(--muted)">#${v.number}</span></div>
      <div class="sub">${v.throws}HP · ${vh(x.outs)} IP · ${x.SO} K · ${x.BB} BB · ${x.ER} ER</div>
      <div class="stats">PITCHES<b>${T}</b></div><div class="stam"><i style="width:${(1-E)*100}%;background:${E>.85?"var(--bad)":E>.6?"#ffb347":"var(--good)"}"></i></div></div>`),t.flight&&(t.phase==="pitch"||t.phase==="postpitch"||t.phase==="live")){const A=t.lastCall==="BALL"?"ball":t.lastCall==="STRIKE"?"strike":"",_=t.phase==="postpitch";this.set("pitchinfo",`<div class="pitchinfo">${_?`<div class="call ${A}">${t.lastCall}</div>`:""}${Math.round(t.flight.mph)} MPH<small>${t.pitchDone||t.phase==="live"||t.userSidePitching()?ye[t.flight.code].name:"&nbsp;"}</small></div>`)}else(t.phase==="prepitch"||t.phase==="atbat_intro")&&this.set("pitchinfo","");if(t.userSidePitching()&&(t.phase==="prepitch"||t.phase==="windup")){const A=t.userPitch,_=v.pitcher;if(this.set("pitchpanel",`<div class="pitchpanel">${_.pitches.map((y,L)=>{const U=ye[y];return`<div class="pt clickable ${y===A.code?"sel":""}" data-pkey="Key${Ya[L]}"><span class="key">${Ya[L]}</span><span class="dot" style="background:${U.color}"></span>${U.name}<span class="mph">${Math.round(_.velocity*U.speed)}</span></div>`}).join("")}<div class="hint">${A.stage==="select"||A.stage==="aim"?"Pick a pitch · aim with the mouse · SPACE to start the meter":A.stage==="meter"?"SPACE when the needle hits the gold line":""}</div></div>`),A.stage==="meter"||A.stage==="locked"){const L=(A.zoneCenter-A.zoneHalf)/1.15*100,U=A.zoneHalf*2/1.15*100,z=(A.locked??A.meter)/1.15*100;this.set("meter",`<div class="meter-label">PITCH METER</div><div class="meter"><div class="zone" style="left:${L-8}%;width:${U+16}%;opacity:.45"></div><div class="zone perfect" style="left:${L}%;width:${U}%"></div><div class="needle" style="left:${z}%"></div></div>`)}else this.set("meter","")}else this.set("pitchpanel",""),e.throwHold||this.set("meter","");if(t.phase==="live"&&t.play&&t.userSidePitching()){const A=t.play,_=A.controlled;if(e.throwHold&&_){const y=mh(_),L=100,U=Math.min(1.2,e.throwHold.t/e.throwFill);this.set("meter",`<div class="meter-label">THROW TO ${Xs[e.throwHold.base]} — release in the green</div><div class="meter"><div class="zone" style="left:${y.start/1.2*L}%;width:${(y.end-y.start)/1.2*L}%"></div><div class="needle" style="left:${U/1.2*L}%"></div></div>`)}if(_&&_.hasBall){const y=new Set;for(const L of A.activeRunners())A.isForced(L)&&L.lastTouched<L.startBase+1&&y.add(L.startBase+1);this.set("throwhint",`<div class="throwhint">THROW: ${[1,2,3,4].map(L=>`<span class="${y.has(L)?"force":""}"><b>${L}</b>${["","1B","2B","3B","HOME"][L]}</span>`).join(" ")} · or run it in with WASD</div>`)}else _?this.set("throwhint",`<div class="throwhint">You control the <b>${_.pos}</b> · WASD move · SHIFT sprint · SPACE dive/leap</div>`):this.set("throwhint","")}else this.set("throwhint","");if(t.userSideBatting()&&(n.bases.some(Boolean)||l&&t.play.activeRunners().length)){const A=[];if(l)for(const _ of t.play.activeRunners()){const y=e.runnerSel===null||(e.runnerSel===0?_.isBatter:_.startBase===e.runnerSel);A.push(`<div class="${y&&e.runnerSel!==null?"sel":""}">${_.isBatter?"BR":Xs[_.startBase]} ${Ke(_.player.name)} → ${Xs[Math.min(4,Math.round(_.goal/90))]}</div>`)}else n.bases.forEach((_,y)=>{_&&A.push(`<div class="${e.runnerSel===y+1?"sel":""}">${y+1}: ${Ke(_.player.name)} <span style="color:var(--muted)">SPD ${_.player.ratings.speed}</span></div>`)});this.set("runners",`<div class="runners">${A.join("")}<div style="color:var(--muted);margin-top:4px">${e.runnerSel===null?"ALL runners":e.runnerSel===0?"Batter-runner":"Runner on "+Xs[e.runnerSel]} · <b>Q</b> go/steal · <b>E</b> back · <b>1-3</b>/<b>4</b> select · <b>0</b> all</div></div>`)}else this.set("runners","");this.set("hint",`<div class="hint-bar">${this.hint(t,e)}</div>`),this.set("replay",e.replayAvailable?'<div class="replay-prompt">R — REPLAY</div>':"")}hint(t,e){const n=s=>`<kbd>${s}</kbd>`;return t.phase==="final"?`${n("ESC")} menu`:t.phase==="live"?t.userSidePitching()?`${n("WASD")} move ${n("SHIFT")} sprint ${n("SPACE")} dive/leap · hold ${n("1")}${n("2")}${n("3")}${n("4")} to throw`:t.userSideBatting()?`${n("Q")} advance ${n("E")} retreat ${n("1-3")} pick runner ${n("4")} batter-runner ${n("0")} all`:"":["atbat_intro","postplay","half_end","postpitch"].includes(t.phase)?`${n("SPACE")} continue · ${n("ESC")} pause${e.replayAvailable?" · "+n("R")+" replay":""}`:t.userSideBatting()?`Mouse/arrows: PCI · ${n("SPACE")} swing · ${n("SHIFT")}+${n("SPACE")} power · ${n("CTRL")}+${n("SPACE")} contact · ${n("Q")} steal · ${n("ESC")} pause <span style="color:var(--accent)">(${e.swingPreview})</span>`:t.userSidePitching()?`${n("A")}${n("S")}${n("D")}${n("F")}${n("G")} pitch · mouse aim · ${n("SPACE")} meter · ${n("ESC")} pause`:`${n("ESC")} pause`}replayUi(t,e,n,s){this.set("banner",""),this.set("replay",`<div class="replay-tag">REPLAY</div><div class="replay-ui"><span>${n?"❚❚":"▶"} ${s<1?s+"x":""}</span><div class="tl"><i style="width:${(Math.min(1,t/Math.max(.01,e))*100).toFixed(1)}%"></i></div>
      <span><kbd>SPACE</kbd> play/pause <kbd>Z</kbd> slow-mo <kbd>←</kbd><kbd>→</kbd> scrub <kbd>drag</kbd>/<kbd>A</kbd><kbd>D</kbd> rotate <kbd>W</kbd><kbd>S</kbd>/wheel zoom <kbd>R</kbd>/<kbd>ESC</kbd> exit</span></div>`)}hideGameplayRegions(t){for(const e of["batter","pitcher","pitchinfo","pitchpanel","meter","hint","runners","throwhint","lower3","feedback"])this.regions.get(e).el.style.display=t?"none":""}}const ri=i=>i.replace(/[&<>"]/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"})[t]);class ex{constructor(t){I(this,"root");I(this,"current",null);I(this,"onClose",null);this.root=t}get open(){return!!this.current}close(){this.current&&(this.current.remove(),this.current=null);const t=this.onClose;this.onClose=null,t==null||t()}show(t,e){this.current&&this.current.remove();const n=document.createElement("div");return n.className="modal",n.innerHTML=`<div class="modal-box">${t}</div>`,n.addEventListener("mousedown",s=>{s.target===n&&this.close()}),this.root.appendChild(n),this.current=n,this.onClose=e??null,n.querySelectorAll("[data-close]").forEach(s=>s.addEventListener("click",()=>this.close())),n}pause(t,e){const n=e?[["resume","Resume"],["lineup","Lineup"],["bullpen","Bullpen"],["stats","Game Stats"],["controls","Controls"],["settings","Settings"],["simhalf","Simulate Half-Inning"],["simend","Simulate to End"],["restart","Restart Game"],["quit","Quit to Menu"]]:[["resume","Close"]];this.show(`<h2>PAUSED</h2><div class="pause-menu">${n.map(([r,a])=>`<button class="btn ${r==="resume"?"primary":""}" data-k="${r}">${a}</button>`).join("")}</div>`,t.resume).querySelectorAll("[data-k]").forEach(r=>r.addEventListener("click",()=>{var o;const a=r.dataset.k;if(a==="resume"){this.close();return}(o=t[a])==null||o.call(t)}))}boxScore(t,e){const n=t.state,s=c=>{const h=t.stats.batOrder[c].map(d=>{const f=Qe(d),g=t.stats.b(d),v=n[c].lineup.find(m=>m.player.id===d);return`<tr><td>${ri(f.name)} <span style="color:var(--muted)">${(v==null?void 0:v.pos)??(n[c].removed.has(d)?"—":f.pos)}</span></td><td class="r">${g.AB}</td><td class="r">${g.R}</td><td class="r">${g.H}</td><td class="r">${g.D}</td><td class="r">${g.T}</td><td class="r">${g.HR}</td><td class="r">${g.RBI}</td><td class="r">${g.BB}</td><td class="r">${g.SO}</td><td class="r">${Dd(g.H,g.AB)}</td></tr>`}).join("");return`<table class="tbl"><tr><th>${n[c].team.name} batting</th><th class="r">AB</th><th class="r">R</th><th class="r">H</th><th class="r">2B</th><th class="r">3B</th><th class="r">HR</th><th class="r">RBI</th><th class="r">BB</th><th class="r">SO</th><th class="r">AVG</th></tr>${h}</table>`},r=c=>{const u=t.stats.pitchOrder[c].map(h=>{const d=Qe(h),f=t.stats.p(h);return`<tr><td>${ri(d.name)}${f.dec?` <b style="color:var(--accent)">(${f.dec})</b>`:""}</td><td class="r">${vh(f.outs)}</td><td class="r">${f.H}</td><td class="r">${f.R}</td><td class="r">${f.ER}</td><td class="r">${f.BB}</td><td class="r">${f.SO}</td><td class="r">${f.HR}</td><td class="r">${f.pitches}</td></tr>`}).join("");return`<table class="tbl"><tr><th>${n[c].team.name} pitching</th><th class="r">IP</th><th class="r">H</th><th class="r">R</th><th class="r">ER</th><th class="r">BB</th><th class="r">SO</th><th class="r">HR</th><th class="r">PC</th></tr>${u}</table>`},a=Math.max(n.settings.innings,n.away.linescore.length,n.home.linescore.length),o=c=>`<tr><td><b>${n[c].team.id}</b></td>${Array.from({length:a},(u,h)=>`<td class="r">${n[c].linescore[h]??""}</td>`).join("")}<td class="r"><b>${n[c].runs}</b></td><td class="r">${n[c].hits}</td><td class="r">${n[c].errors}</td></tr>`;this.show(`<h2>BOX SCORE</h2>
      <table class="tbl" style="width:auto;margin-bottom:12px"><tr><th></th>${Array.from({length:a},(c,u)=>`<th class="r">${u+1}</th>`).join("")}<th class="r">R</th><th class="r">H</th><th class="r">E</th></tr>${o("away")}${o("home")}</table>
      <div class="box-grid"><div>${s("away")}${r("away")}</div><div>${s("home")}${r("home")}</div></div>
      <div style="margin-top:14px;text-align:right"><button class="btn" data-back>Back</button></div>`).querySelector("[data-back]").addEventListener("click",()=>e?e():this.close())}lineup(t,e,n){const s=t.state[e],r=new Set(s.lineup.map(f=>f.player.id)),a=zr(s.team).filter(f=>!r.has(f.id)&&!s.removed.has(f.id)),o=new Set(t.state.bases.filter(Boolean).map(f=>f.player.id)),l=["C","1B","2B","3B","SS","LF","CF","RF","DH"],c=t.state.half==="top"?e==="away":e==="home",u=s.lineup.map((f,g)=>{const m=c&&s.battingIdx===g?' <b style="color:var(--accent)">AT BAT</b>':o.has(f.player.id)?' <b style="color:#6be38f">ON BASE</b>':"",p=t.stats.b(f.player.id);return`<tr><td class="num">${g+1}</td><td>${ri(f.player.name)}${m}</td>
        <td><select data-pos="${g}">${l.map(M=>`<option ${M===f.pos?"selected":""}>${M}</option>`).join("")}</select>${Zo(f.player,f.pos)?"":' <span class="warn">⚠</span>'}</td>
        <td class="r">${p.H}-${p.AB}</td>
        <td><select data-sub="${g}"><option value="">— substitute —</option>${a.map(M=>`<option value="${M.id}">${ri(M.name)} (${M.pos}${M.secondary.length?"/"+M.secondary.join("/"):""})</option>`).join("")}</select></td></tr>`}).join(""),h=t.phase==="live"||t.phase==="windup"||t.phase==="pitch",d=this.show(`<h2>${ri(s.team.name.toUpperCase())} LINEUP</h2>
      <div class="stars" style="margin-bottom:8px">Substitute the batter at the plate for a <b>pinch hitter</b>, a player on base for a <b>pinch runner</b>, or anyone for a <b>defensive replacement</b>. Changing positions swaps with whoever holds that spot. Replaced players can't return.</div>
      <table class="tbl"><tr><th>#</th><th>Player</th><th>Pos</th><th class="r">Today</th><th>Substitute</th></tr>${u}</table>
      ${h?'<div class="warn" style="margin-top:8px">Changes apply between pitches.</div>':""}
      <div style="margin-top:14px;text-align:right"><button class="btn" data-back>Back</button></div>`);d.querySelectorAll("[data-sub]").forEach(f=>f.addEventListener("change",()=>{if(!f.value)return;const g=Number(f.dataset.sub);t.substitute(e,g,f.value),this.lineup(t,e,n)})),d.querySelectorAll("[data-pos]").forEach(f=>f.addEventListener("change",()=>{const g=Number(f.dataset.pos),v=s.lineup.findIndex((m,p)=>p!==g&&m.pos===f.value);v>=0?t.swapPositions(e,g,v):s.lineup[g].pos=f.value,this.lineup(t,e,n)})),d.querySelector("[data-back]").addEventListener("click",n)}bullpen(t,e,n){const s=t.state[e],r=s.pitcher,a=s.pitchCounts.get(r.id)??0,o=Fs(s),l=s.team.roster.filter(d=>d.pitcher&&d.id!==r.id&&!s.removed.has(d.id)&&!s.pitchersUsed.includes(d)),c=t.state.half==="top"?e==="home":e==="away",u=l.map(d=>{const f=d.pitcher,g=s.warmup.get(d.id)??(f.role==="SP",0),v=s.warming===d.id;return`<tr><td>${ri(d.name)}</td><td>${f.role}</td><td>${d.throws}HP</td><td class="r">${f.velocity}</td><td class="r">${f.control}</td><td class="r">${f.break}</td><td style="color:var(--muted)">${f.pitches.map(m=>ye[m].short).join(" ")}</td>
        <td style="width:110px"><div class="stam"><i style="width:${Math.round(g*100)}%;background:${g>=1?"var(--good)":"#ffb347"}"></i></div><span style="font-size:11px;color:var(--muted)">${g>=1?"READY":v?"warming "+Math.round(g*100)+"%":Math.round(g*100)+"%"}</span></td>
        <td><button class="btn small" data-warm="${d.id}">${v?"Sit":"Warm up"}</button> <button class="btn small ${g>=1?"primary":""}" data-in="${d.id}" ${c?"":"disabled"}>Bring in</button></td></tr>`}).join(""),h=this.show(`<h2>BULLPEN</h2>
      <div class="stars">On the mound: <b>${ri(r.name)}</b> — ${a} pitches (budget ~${Math.round(gh(r))}) · fatigue ${Math.round(Math.min(1.5,o)*100)}%</div>
      <div class="stars" style="margin-bottom:8px">Relievers warm up with every pitch thrown. A pitcher brought in before he's ready is less effective.</div>
      <table class="tbl"><tr><th>Pitcher</th><th>Role</th><th></th><th class="r">VEL</th><th class="r">CTL</th><th class="r">BRK</th><th>Pitches</th><th>Warm</th><th></th></tr>${u}</table>
      <div style="margin-top:14px;text-align:right"><button class="btn" data-back>Back</button></div>`);h.querySelectorAll("[data-warm]").forEach(d=>d.addEventListener("click",()=>{const f=d.dataset.warm;t.warmUp(e,s.warming===f?null:f),s.warmup.has(f)||s.warmup.set(f,0),this.bullpen(t,e,n)})),h.querySelectorAll("[data-in]").forEach(d=>d.addEventListener("click",()=>{t.bringInPitcher(e,d.dataset.in),n()})),h.querySelector("[data-back]").addEventListener("click",n)}controls(t){const e=(s,r)=>`<div class="k"><span>${s}</span><span>${r.split(" ").map(a=>`<kbd>${a}</kbd>`).join(" ")}</span></div>`;this.show(`<h2>CONTROLS</h2><div class="controls-grid">
      <div><h3>BATTING</h3>${e("Move PCI","Mouse")}${e("Move PCI (keys / pad)","Arrows")}${e("Normal swing","SPACE")}${e("Power swing","SHIFT+SPACE")}${e("Contact swing","CTRL+SPACE")}${e("Contact swing (alt)","ALT+SPACE")}${e("Swing / power swing","L-Click R-Click")}${e("Steal (before the pitch)","Q")}</div>
      <div><h3>PITCHING</h3>${e("Select pitch","A S D F G H")}${e("Aim","Mouse")}${e("Start meter","SPACE")}${e("Stop meter at the gold line","SPACE")}</div>
      <div><h3>FIELDING</h3>${e("Move (camera-relative)","W A S D")}${e("Sprint","SHIFT")}${e("Dive / leap at the wall","SPACE")}${e("Throw to 1st / 2nd / 3rd / home","1 2 3 4")}${e("Throw strength","hold, release in green")}</div>
      <div><h3>BASERUNNING</h3>${e("Advance runners","Q")}${e("Retreat runners","E")}${e("Select runner on 1st/2nd/3rd","1 2 3")}${e("Select batter-runner","4")}${e("Select all runners","0")}</div>
      <div><h3>GAME</h3>${e("Pause menu","ESC")}${e("Instant replay","R")}${e("Skip / continue","SPACE ENTER")}</div>
      <div><h3>REPLAY</h3>${e("Play / pause","SPACE")}${e("Slow motion","Z")}${e("Scrub","← →")}${e("Rotate camera","A D drag")}${e("Zoom","W S wheel")}</div>
      <div><h3>GAMEPAD</h3>${e("PCI / move","L-stick")}${e("Swing / dive / meter","A")}${e("Power / contact","RT LT")}${e("Pitches","X Y B ↑ ↓")}${e("Throw to bases","D-pad")}${e("Advance / retreat","RB LB")}</div>
    </div><div style="margin-top:14px;text-align:right"><button class="btn" data-back>Back</button></div>`).querySelector("[data-back]").addEventListener("click",()=>t?t():this.close())}settings(t,e,n){const s=(o,l)=>`<div class="settings-row"><span>${o}</span>${l}</div>`,r=o=>`<button class="btn small ${t[o]?"sel":""}" data-t="${o}">${t[o]?"ON":"OFF"}</button>`,a=this.show(`<h2>SETTINGS</h2><div style="min-width:440px">
      ${s("Pitch speed (when batting)",`<select data-s="pitchSpeed"><option value="auto" ${t.pitchSpeed==="auto"?"selected":""}>By difficulty</option><option value="slow" ${t.pitchSpeed==="slow"?"selected":""}>Slower</option><option value="real" ${t.pitchSpeed==="real"?"selected":""}>Real speed</option></select>`)}
      ${s("Fielding assist (auto-route until you move)",r("fieldingAssist"))}
      ${s("Baserunning assist (runners make their own reads)",r("runningAssist"))}
      ${s("Show strike zone",r("showStrikeZone"))}
      ${s("Camera shake",r("cameraShake"))}
      ${s("Master volume",`<input type="range" min="0" max="1" step="0.05" value="${t.volume}" data-r="volume"/>`)}
      ${s("Crowd volume",`<input type="range" min="0" max="1" step="0.05" value="${t.crowdVolume}" data-r="crowdVolume"/>`)}
    </div><div style="margin-top:14px;text-align:right"><button class="btn" data-back>Back</button></div>`);a.querySelectorAll("[data-t]").forEach(o=>o.addEventListener("click",()=>{const l=o.dataset.t;t[l]=!t[l],e(t),this.settings(t,e,n)})),a.querySelectorAll("[data-s]").forEach(o=>o.addEventListener("change",()=>{t[o.dataset.s]=o.value,e(t)})),a.querySelectorAll("[data-r]").forEach(o=>o.addEventListener("input",()=>{t[o.dataset.r]=Number(o.value),e(t)})),a.querySelector("[data-back]").addEventListener("click",()=>n?n():this.close())}}const Xa=["C","1B","2B","3B","SS","LF","CF","RF","DH"],nx=["Team","Opponent","Ballpark","Lineup","Difficulty"],ix={ROOKIE:"Big PCI, generous timing, slower pitches. CPU pitchers leave lots of mistakes over the plate and CPU hitters chase.",MINORS:"Forgiving timing and PCI. CPU pitchers miss spots often; hitters are easy to fool.",VETERAN:"A fair fight. CPU sequences pitches sensibly and makes the occasional mistake.","ALL-STAR":"Real-speed pitches. CPU hitters recognize spin well and CPU pitchers hit their spots.","HALL OF FAME":"Tight timing windows and a smaller PCI. CPU pitchers nibble and change speeds intelligently.",LEGEND:"Elite AI: rarely misses locations, rarely chases, punishes every mistake."},Le=i=>i.replace(/[&<>"]/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"})[t]);function sx(i){return i>=75?"hi":i>=55?"mid":"lo"}function qa(i){return`background: linear-gradient(135deg, ${i.colors.primary}, ${rx(i.colors.primary,-.35)}); color: #fff;`}function rx(i,t){const e=parseInt(i.slice(1),16),n=o=>Math.max(0,Math.min(255,Math.round(o+o*t))),s=n(e>>16&255),r=n(e>>8&255),a=n(e&255);return`#${(s<<16|r<<8|a).toString(16).padStart(6,"0")}`}class ax{constructor(t,e){I(this,"root");I(this,"cb");I(this,"s",{user:null,opp:null,userHome:!0,stadiumId:null,cond:{time:"Night",weather:"Clear",temperature:72,windMph:6,windDir:0},lineup:[],sp:"",difficulty:"VETERAN",innings:9,ghost:!0});I(this,"detailTeam",null);this.root=t,this.cb=e}mount(t){this.root.innerHTML=t;const e=this.root.firstElementChild;return e.querySelectorAll("button, .team-card, .park, .diff").forEach(n=>n.addEventListener("click",()=>this.cb.click())),e}head(t,e){return`<div class="screen-head"><h1>${t}</h1><div class="steps">${nx.map((n,s)=>`<span class="${s===e?"on":""}">${s+1} ${n}</span>`).join("")}</div></div>`}hide(){this.root.innerHTML=""}showHome(){const t=this.mount(`<div class="screen home">
      <div class="logo">DIAM<span class="ball"></span>ND<br/>'26<small>BASEBALL</small></div>
      <div class="home-menu">
        <button class="btn primary" data-a="play">Play Ball</button>
        <button class="btn" data-a="controls">Controls</button>
        <button class="btn" data-a="settings">Settings</button>
      </div>
      <div class="home-foot">Personal, non-commercial project · all 30 clubs · rosters editable in src/baseball/data/rosters</div>
    </div>`);t.querySelector("[data-a=play]").addEventListener("click",()=>this.showTeams("user")),t.querySelector("[data-a=controls]").addEventListener("click",()=>this.cb.openControls()),t.querySelector("[data-a=settings]").addEventListener("click",()=>this.cb.openSettings())}teamGrid(t){const e=t==="user"?this.s.user:this.s.opp,n=s=>`<div class="league"><h2>${s==="AL"?"AMERICAN LEAGUE":"NATIONAL LEAGUE"}</h2>${["East","Central","West"].map(r=>`<div class="division"><h3>${s} ${r}</h3><div class="team-row">${Vn.filter(a=>a.league===s&&a.division===r).map(a=>{const o=bl(a),l=t==="opp"&&a.id===this.s.user;return`<div class="team-card ${a.id===e?"sel":""} ${l?"disabled":""}" data-id="${a.id}" style="${qa(a)}">
            <div class="ovr">${o.overall}</div><div class="abbr">${a.id}</div><div class="nm">${Le(a.city)} ${Le(a.name)}</div>
            <div class="minibars">${[o.power,o.contact,o.speed,o.defense,o.starting,o.bullpen].map(c=>`<div><i style="width:${c}%"></i></div>`).join("")}</div>
            <div class="stripe" style="background:${a.colors.secondary}"></div></div>`}).join("")}</div></div>`).join("")}</div>`;return`<div class="leagues">${n("AL")}${n("NL")}</div>`}teamDetail(t){if(!t)return'<div class="team-detail"><div class="stars">Select a club to see its strengths. Bars on each card: POW · CON · SPD · DEF · SP · BP</div></div>';const e=Ze[t],n=bl(e),s=(l,c)=>`<div class="attr"><span>${l}</span><div class="bar"><i style="width:${c}%"></i></div><b>${c}</b></div>`,a=[...sa(e).lineup.map(l=>Qe(l.playerId))].sort((l,c)=>c.ratings.powerR+c.ratings.contactR-(l.ratings.powerR+l.ratings.contactR)).slice(0,4),o=kr(e).slice(0,3);return`<div class="team-detail">
      <div><div style="font-family:var(--display);font-size:28px">${Le(e.city)} ${Le(e.name)}</div>
        <div class="stars">${Le(Vi[e.stadiumId].name)} · ${e.league} ${e.division}</div>
        <div style="font-family:var(--display);font-size:46px;color:var(--accent)">${n.overall} <span style="font-size:16px;color:var(--muted)">OVR</span></div></div>
      <div>${s("Power",n.power)}${s("Contact",n.contact)}${s("Speed",n.speed)}${s("Defense",n.defense)}${s("Rotation",n.starting)}${s("Bullpen",n.bullpen)}</div>
      <div class="stars"><b>Key bats:</b> ${a.map(l=>Le(l.name)).join(", ")}<br/><b>Rotation:</b> ${o.map(l=>`${Le(l.name)} (${l.pitcher.velocity})`).join(", ")}</div>
    </div>`}showTeams(t){var n;this.detailTeam=t==="user"?this.s.user:this.s.opp;const e=this.mount(`<div class="screen">${this.head(t==="user"?"Select your team":"Select opponent",t==="user"?0:1)}
      <div class="screen-body">${this.teamGrid(t)}<div id="detail">${this.teamDetail(this.detailTeam)}</div></div>
      <div class="screen-foot"><div class="grow">${t==="user"?"You control this team on the field. The CPU controls the opponent.":"The computer will manage and play this club."}</div>
      ${t==="opp"?'<button class="btn" data-a="random">Random</button>':""}<button class="btn" data-a="back">Back</button><button class="btn primary" data-a="next" ${this.detailTeam?"":"disabled"}>Next</button></div></div>`);e.querySelectorAll(".team-card").forEach(s=>s.addEventListener("click",()=>{const r=s.dataset.id;t==="user"?this.s.user=r:this.s.opp=r,e.querySelectorAll(".team-card").forEach(a=>a.classList.toggle("sel",a===s)),e.querySelector("#detail").innerHTML=this.teamDetail(r),e.querySelector("[data-a=next]").disabled=!1})),e.querySelector("[data-a=back]").addEventListener("click",()=>t==="user"?this.showHome():this.showTeams("user")),(n=e.querySelector("[data-a=random]"))==null||n.addEventListener("click",()=>{const s=Vn.filter(r=>r.id!==this.s.user);this.s.opp=s[Math.floor(Math.random()*s.length)].id,this.showTeams("opp")}),e.querySelector("[data-a=next]").addEventListener("click",()=>{t==="user"?(this.s.opp===this.s.user&&(this.s.opp=null),this.resetLineup(),this.showTeams("opp")):(this.s.stadiumId=Ze[this.s.userHome?this.s.user:this.s.opp].stadiumId,this.showStadium())})}resetLineup(){const t=Ze[this.s.user],e=sa(t,Math.floor(Math.random()*5));this.s.lineup=e.lineup,this.s.sp=e.startingPitcherId}parkSvg(t,e=54){const n=Vi[t],s=[],r=e/460;for(let o=-45;o<=45;o+=5){const l=Oe(n,o)*r,c=e/2+Math.sin(o*Math.PI/180)*l,u=e-4-Math.cos(o*Math.PI/180)*l;s.push(`${c.toFixed(1)},${u.toFixed(1)}`)}const a=`${e/2},${e-4}`;return`<svg width="${e}" height="${e}" viewBox="0 0 ${e} ${e}"><polygon points="${a} ${s.join(" ")}" fill="#2f7a33" stroke="${n.wallColor==="#24533a"?"#4caf50":"#ffffff"}" stroke-width="1.2"/><polygon points="${a} ${e/2+9},${e-13} ${e/2},${e-22} ${e/2-9},${e-13}" fill="#b07a4a"/></svg>`}showStadium(){const t=this.s,e=Ze[t.userHome?t.user:t.opp],n=Ze[t.userHome?t.opp:t.user],s=(h,d,f)=>`<div class="seg" data-g="${h}">${d.map(g=>`<button class="btn ${g===f?"sel":""}" data-v="${g}">${g}</button>`).join("")}</div>`,r=this.mount(`<div class="screen">${this.head("Ballpark & conditions",2)}
      <div class="screen-body">
        <div class="cond">
          <div><label>You are</label>${s("side",["Home","Away"],t.userHome?"Home":"Away")}</div>
          <div><label>Time</label>${s("time",["Day","Afternoon","Night"],t.cond.time)}</div>
          <div><label>Weather</label>${s("weather",["Clear","Cloudy","Light Rain"],t.cond.weather)}</div>
          <div><label>Temperature <b id="tv">${t.cond.temperature}°F</b></label><input type="range" min="40" max="100" value="${t.cond.temperature}" id="temp"/></div>
          <div><label>Wind <b id="wv">${t.cond.windMph} mph ${Tr(t.cond.windDir)}</b></label><input type="range" min="0" max="20" value="${t.cond.windMph}" id="wind"/>
            <select id="wdir">${[0,45,90,135,180,225,270,315].map(h=>`<option value="${h}" ${h===t.cond.windDir?"selected":""}>${Tr(h)}</option>`).join("")}</select></div>
        </div>
        <div style="margin:4px 0 10px;color:var(--muted);font-size:13px">${Le(n.name)} at ${Le(e.name)} · choose any park (default: home team's). Dimensions really change how far a ball must carry.</div>
        <div class="park-grid">${ah.map(h=>`<div class="park ${h.id===t.stadiumId?"sel":""}" data-id="${h.id}">${this.parkSvg(h.id)}<div><div class="pn">${Le(h.name)}</div>
          <div class="pd">${h.dims[0]} · ${h.dims[2]} · ${h.dims[4]}${h.altitude>3e3?" · "+h.altitude+" ft alt":""}</div>${h.feature?`<div class="pd" style="color:#cbd6e6">${Le(h.feature)}</div>`:""}</div></div>`).join("")}</div>
      </div>
      <div class="screen-foot"><div class="grow"></div><button class="btn" data-a="back">Back</button><button class="btn primary" data-a="next">Next</button></div></div>`),a=()=>{const h=t.userHome?t.user:t.opp,d=t.userHome?t.opp:t.user;this.cb.onPreview(t.stadiumId,t.cond,h,d)};a(),r.querySelectorAll(".seg").forEach(h=>h.querySelectorAll("button").forEach(d=>d.addEventListener("click",()=>{h.querySelectorAll("button").forEach(v=>v.classList.toggle("sel",v===d));const f=d.dataset.v,g=h.dataset.g;if(g==="side"){t.userHome=f==="Home",t.stadiumId=Ze[t.userHome?t.user:t.opp].stadiumId,this.showStadium();return}g==="time"&&(t.cond.time=f),g==="weather"&&(t.cond.weather=f),a()})));const o=r.querySelector("#temp");o.addEventListener("input",()=>{t.cond.temperature=Number(o.value),r.querySelector("#tv").textContent=`${o.value}°F`});const l=r.querySelector("#wind"),c=r.querySelector("#wdir"),u=()=>{t.cond.windMph=Number(l.value),t.cond.windDir=Number(c.value),r.querySelector("#wv").textContent=`${l.value} mph ${Tr(t.cond.windDir)}`};l.addEventListener("input",u),c.addEventListener("change",u),r.querySelectorAll(".park").forEach(h=>h.addEventListener("click",()=>{t.stadiumId=h.dataset.id,r.querySelectorAll(".park").forEach(d=>d.classList.toggle("sel",d===h)),a()})),r.querySelector("[data-a=back]").addEventListener("click",()=>this.showTeams("opp")),r.querySelector("[data-a=next]").addEventListener("click",()=>this.showLineup())}lineupErrors(){const t=[],e=this.s.lineup.map(s=>s.pos);for(const s of Xa)e.includes(s)||t.push(`No ${s}`);const n=Xa.filter(s=>e.filter(r=>r===s).length>1);return n.length&&t.push(`Duplicate: ${n.join(", ")}`),t}showLineup(){const t=this.s,e=Ze[t.user],n=t.lineup.map(h=>h.playerId),s=zr(e).filter(h=>!n.includes(h.id)),r=h=>`<span class="rate ${sx(h)}">${h}</span>`,a=t.lineup.map((h,d)=>{const f=Qe(h.playerId),g=Zo(f,h.pos),v=ja(f);return`<tr>
        <td class="num">${d+1}</td>
        <td><select data-slot="${d}" class="pl">${zr(e).map(m=>`<option value="${m.id}" ${m.id===f.id?"selected":""} ${n.includes(m.id)&&m.id!==f.id?"disabled":""}>${Le(m.name)}</option>`).join("")}</select></td>
        <td><select data-slot="${d}" class="ps">${Xa.map(m=>`<option ${m===h.pos?"selected":""}>${m}</option>`).join("")}</select>${g?"":' <span class="warn" title="Out of position">⚠</span>'}</td>
        <td>${f.bats}</td><td class="r">${r(Math.round((f.ratings.contactR+f.ratings.contactL)/2))}</td><td class="r">${r(Math.round((f.ratings.powerR+f.ratings.powerL)/2))}</td><td class="r">${r(f.ratings.speed)}</td><td class="r">${r(f.ratings.fielding)}</td>
        <td class="r" style="color:var(--muted)">${v.avg} / ${v.hr}</td>
        <td><button class="btn small" data-up="${d}">▲</button> <button class="btn small" data-dn="${d}">▼</button></td></tr>`}).join(""),o=kr(e),l=e.roster.filter(h=>h.pitcher).map(h=>{const d=h.pitcher,f=xh(h);return`<tr><td><input type="radio" name="sp" value="${h.id}" ${h.id===t.sp?"checked":""} ${d.role!=="SP"&&!o.length,""}/></td><td>${Le(h.name)}</td><td>${d.role}</td><td>${h.throws}HP</td>
        <td class="r">${d.velocity}</td><td class="r">${r(d.control)}</td><td class="r">${r(d.break)}</td><td class="r">${r(d.stamina)}</td><td style="color:var(--muted)">${d.pitches.map(g=>ye[g].short).join(" ")}</td><td class="r" style="color:var(--muted)">${f.era}</td></tr>`}).join(""),c=this.lineupErrors(),u=this.mount(`<div class="screen">${this.head(`${Le(e.name)} lineup`,3)}
      <div class="screen-body"><div class="lineup-wrap">
        <div class="panel"><h3>Batting order</h3>
          <table class="tbl"><tr><th>#</th><th>Player</th><th>Pos</th><th>B</th><th class="r">CON</th><th class="r">POW</th><th class="r">SPD</th><th class="r">FLD</th><th class="r">AVG/HR</th><th></th></tr>${a}</table>
          <div class="warn" style="margin-top:8px">${c.join(" · ")}</div>
          <h3 style="margin-top:14px">Bench</h3><div class="stars">${s.map(h=>`${Le(h.name)} <span style="color:var(--muted)">${h.pos}${h.secondary.length?"/"+h.secondary.join("/"):""}</span>`).join(" · ")||"—"}</div>
        </div>
        <div class="panel"><h3>Starting pitcher</h3>
          <table class="tbl"><tr><th></th><th>Pitcher</th><th>Role</th><th></th><th class="r">VEL</th><th class="r">CTL</th><th class="r">BRK</th><th class="r">STA</th><th>Pitches</th><th class="r">ERA</th></tr>${l}</table>
        </div>
      </div></div>
      <div class="screen-foot"><div class="grow">Change a player or position with the dropdowns; reorder with ▲▼.</div><button class="btn" data-a="auto">Default lineup</button><button class="btn" data-a="back">Back</button><button class="btn primary" data-a="next" ${c.length?"disabled":""}>Next</button></div></div>`);u.querySelectorAll("select.pl").forEach(h=>h.addEventListener("change",()=>{const d=Number(h.dataset.slot),f=Qe(h.value);t.lineup[d]={playerId:f.id,pos:t.lineup[d].pos},this.showLineup()})),u.querySelectorAll("select.ps").forEach(h=>h.addEventListener("change",()=>{const d=Number(h.dataset.slot),f=h.value,g=t.lineup.findIndex((v,m)=>m!==d&&v.pos===f);g>=0&&(t.lineup[g].pos=t.lineup[d].pos),t.lineup[d].pos=f,this.showLineup()})),u.querySelectorAll("[data-up]").forEach(h=>h.addEventListener("click",()=>{const d=Number(h.dataset.up);d>0&&([t.lineup[d-1],t.lineup[d]]=[t.lineup[d],t.lineup[d-1]]),this.showLineup()})),u.querySelectorAll("[data-dn]").forEach(h=>h.addEventListener("click",()=>{const d=Number(h.dataset.dn);d<8&&([t.lineup[d+1],t.lineup[d]]=[t.lineup[d],t.lineup[d+1]]),this.showLineup()})),u.querySelectorAll("input[name=sp]").forEach(h=>h.addEventListener("change",()=>{t.sp=h.value})),u.querySelector("[data-a=auto]").addEventListener("click",()=>{this.resetLineup(),this.showLineup()}),u.querySelector("[data-a=back]").addEventListener("click",()=>this.showStadium()),u.querySelector("[data-a=next]").addEventListener("click",()=>this.showDifficulty())}showDifficulty(){const t=this.s,e=Ze[t.user],n=Ze[t.opp],s=t.userHome?n:e,r=t.userHome?e:n,a=this.mount(`<div class="screen">${this.head("Difficulty & game length",4)}
      <div class="screen-body">
        <div class="matchup"><div class="tm" style="${qa(s)}">${s.id}</div><div class="vs">at</div><div class="tm" style="${qa(r)}">${r.id}</div>
          <div class="stars" style="margin-left:12px">${Le(Vi[t.stadiumId].name)}<br/>${t.cond.time} · ${t.cond.weather} · ${t.cond.temperature}°F · wind ${t.cond.windMph} mph ${Tr(t.cond.windDir)}</div></div>
        <div class="diff-grid">${vu.map(o=>`<div class="diff ${o===t.difficulty?"sel":""}" data-d="${o}"><h4>${o}</h4><p>${ix[o]}</p></div>`).join("")}</div>
        <div class="cond" style="margin-top:22px">
          <div><label>Innings</label><div class="seg" data-g="inn">${[1,3,6,9].map(o=>`<button class="btn ${o===t.innings?"sel":""}" data-v="${o}">${o}</button>`).join("")}</div></div>
          <div><label>Extra innings</label><div class="seg" data-g="ghost"><button class="btn ${t.ghost?"sel":""}" data-v="1">Runner on 2nd</button><button class="btn ${t.ghost?"":"sel"}" data-v="0">Classic</button></div></div>
        </div>
      </div>
      <div class="screen-foot"><div class="grow"></div><button class="btn" data-a="back">Back</button><button class="btn primary" data-a="go" style="font-size:22px;padding:12px 36px">Play Ball!</button></div></div>`);a.querySelectorAll(".diff").forEach(o=>o.addEventListener("click",()=>{t.difficulty=o.dataset.d,a.querySelectorAll(".diff").forEach(l=>l.classList.toggle("sel",l===o))})),a.querySelectorAll("[data-g=inn] button").forEach(o=>o.addEventListener("click",()=>{t.innings=Number(o.dataset.v),a.querySelectorAll("[data-g=inn] button").forEach(l=>l.classList.toggle("sel",l===o))})),a.querySelectorAll("[data-g=ghost] button").forEach(o=>o.addEventListener("click",()=>{t.ghost=o.dataset.v==="1",a.querySelectorAll("[data-g=ghost] button").forEach(l=>l.classList.toggle("sel",l===o))})),a.querySelector("[data-a=back]").addEventListener("click",()=>this.showLineup()),a.querySelector("[data-a=go]").addEventListener("click",()=>this.cb.onStart(this.buildSettings()))}buildSettings(){const t=this.s,e={teamId:t.user,lineup:t.lineup.map(r=>({...r})),startingPitcherId:t.sp},n=Ze[t.opp],s=sa(n,Math.floor(Math.random()*5));return{innings:t.innings,difficulty:t.difficulty,stadiumId:t.stadiumId,conditions:{...t.cond},home:t.userHome?e:s,away:t.userHome?s:e,userSide:t.userHome?"home":"away",ghostRunner:t.ghost}}}function Tr(i){return{0:"out to CF",45:"out to RF",90:"L→R",135:"in from LF",180:"in from CF",225:"in from RF",270:"R→L",315:"out to LF"}[i]??`${i}°`}const lu="diamond26.prefs";function ox(){try{const i=localStorage.getItem(lu);if(i)return{...Ml,...JSON.parse(i)}}catch{}return{...Ml}}function lx(i){try{localStorage.setItem(lu,JSON.stringify(i))}catch{}}class cx{constructor(){I(this,"root",document.getElementById("game-root"));I(this,"ui",document.getElementById("ui"));I(this,"renderer");I(this,"ctrl");I(this,"audio",new QS);I(this,"modals");I(this,"menu");I(this,"hud",null);I(this,"engine",null);I(this,"settings",null);I(this,"prefs",ox());I(this,"replay",new Bl);I(this,"mode","menu");I(this,"touch",null);I(this,"paused",!1);I(this,"hrCam",0);I(this,"replayPrompt",!1);I(this,"finalShown",!1);I(this,"last",performance.now());I(this,"drag",null);I(this,"notableThisPitch",[]);I(this,"finalEl",null);this.renderer=new YS(document.getElementById("canvas-wrap")),this.ctrl=new JS(this.renderer.renderer.domElement),KS()&&(document.body.classList.add("touch-device"),this.touch=new ZS(this.root,this.renderer.renderer.domElement,this.ctrl),this.touch.onPause=()=>{var n;this.replay.active?(this.replay.close(),(n=this.hud)==null||n.hideGameplayRegions(!1)):this.modals.open?this.modals.close():this.mode==="game"&&!this.finalShown&&this.openPause()},this.touch.onAnyTouch=()=>this.audio.unlock(),this.touch.onReplayDrag=(n,s)=>{const r=this.renderer.camMgr.replay;r.yaw-=n*.008,r.pitch=Math.max(.05,Math.min(1.45,r.pitch+s*.006))},this.touch.onReplayPinch=n=>{const s=this.renderer.camMgr.replay;s.dist=Math.max(12,Math.min(420,s.dist*n))}),this.ui.addEventListener("pointerdown",n=>{const s=n.target.closest("[data-pkey]");s&&(n.preventDefault(),this.ctrl.virtualDown(s.dataset.pkey),setTimeout(()=>this.ctrl.virtualUp(s.dataset.pkey),60))}),this.modals=new ex(this.ui),this.menu=new ax(this.ui,{onStart:n=>this.startGame(n),onPreview:(n,s,r,a)=>this.preview(n,s,r,a),openControls:()=>this.modals.controls(),openSettings:()=>this.openSettings(),click:()=>this.audio.unlock()}),this.audio.setVolume(this.prefs.volume,this.prefs.crowdVolume);const t=this.renderer.renderer.domElement;t.addEventListener("mousedown",n=>{this.replay.active&&(this.drag={x:n.clientX,y:n.clientY}),this.audio.unlock()}),window.addEventListener("mouseup",()=>this.drag=null),window.addEventListener("mousemove",n=>{if(!this.drag||!this.replay.active)return;const s=this.renderer.camMgr.replay;s.yaw-=(n.clientX-this.drag.x)*.006,s.pitch=Math.max(.05,Math.min(1.45,s.pitch+(n.clientY-this.drag.y)*.005)),this.drag={x:n.clientX,y:n.clientY}}),t.addEventListener("wheel",n=>{if(!this.replay.active)return;const s=this.renderer.camMgr.replay;s.dist=Math.max(12,Math.min(420,s.dist*(n.deltaY>0?1.1:.9))),n.preventDefault()},{passive:!1}),window.addEventListener("keydown",()=>this.audio.unlock(),{once:!0});const e=Vn[Math.floor(Math.random()*Vn.length)];this.preview(e.stadiumId,{time:"Night",weather:"Clear",temperature:72,windMph:0,windDir:0},e.id,Vn[(Vn.indexOf(e)+7)%30].id),this.renderer.camMgr.setMode("menu",!0),this.menu.showHome(),requestAnimationFrame(n=>this.loop(n))}preview(t,e,n,s){this.renderer.loadGame({stadiumId:t,conditions:e,homeId:n,awayId:s})}openSettings(t){this.modals.settings(this.prefs,e=>{this.prefs=e,lx(e),this.audio.setVolume(e.volume,e.crowdVolume),this.engine&&(this.engine.prefs=e)},t)}startGame(t){var s;this.audio.unlock(),this.settings=t,this.menu.hide(),this.closeFinal(),this.renderer.loadGame({stadiumId:t.stadiumId,conditions:t.conditions,homeId:t.home.teamId,awayId:t.away.teamId}),this.engine=new Wd(t,this.prefs),(s=this.hud)==null||s.destroy(),this.hud=new tx(this.ui),this.mode="game",this.paused=!1,this.finalShown=!1,this.replay=new Bl,this.replayPrompt=!1,this.renderer.camMgr.setMode("overview",!0),this.audio.startAmbience(),this.audio.play("organ");const e=this.engine.state.away.team,n=this.engine.state.home.team;this.hud.banner("PLAY BALL!",`${e.city} ${e.name} at ${n.city} ${n.name}`,"gold",2.4),this.handleEvents(this.engine.drainEvents())}quitToMenu(){var t;this.modals.close(),this.closeFinal(),this.engine=null,(t=this.hud)==null||t.destroy(),this.hud=null,this.mode="menu",this.paused=!1,this.replay.close(),this.audio.stopAmbience(),this.renderer.camMgr.setMode("menu"),this.menu.showHome()}openPause(){if(!this.engine)return;this.paused=!0;const t=this.engine,e=t.settings.userSide==="none"?"home":t.settings.userSide,n=()=>this.openPause();this.modals.pause({resume:()=>{this.paused=!1},lineup:()=>this.modals.lineup(t,e,n),bullpen:()=>this.modals.bullpen(t,e,n),stats:()=>this.modals.boxScore(t,n),controls:()=>this.modals.controls(n),settings:()=>this.openSettings(n),simhalf:()=>{this.modals.onClose=null,this.modals.close(),this.paused=!1,t.simulateHalfInning()},simend:()=>{this.modals.onClose=null,this.modals.close(),this.paused=!1,t.simulateToEnd()},restart:()=>{this.modals.onClose=null,this.modals.close(),this.settings&&this.startGame(this.settings)},quit:()=>{this.modals.onClose=null,this.quitToMenu()}},!0)}closeFinal(){var t;(t=this.finalEl)==null||t.remove(),this.finalEl=null}showFinal(t,e){const n=this.engine,s=n.state,r=o=>`background:${o.team.colors.primary}`,a=document.createElement("div");a.className="final",a.innerHTML=`<div style="font-family:var(--display);font-size:72px;color:var(--accent)">${t}</div>
      <div class="score"><span class="tm" style="${r(s.away)}">${s.away.team.id}</span>${s.away.runs} – ${s.home.runs}<span class="tm" style="${r(s.home)}">${s.home.team.id}</span></div>
      <div style="margin-bottom:22px;color:var(--muted)">${e}</div>
      <div style="display:flex;gap:12px"><button class="btn" data-a="box">Box Score</button><button class="btn" data-a="again">Play Again</button><button class="btn primary" data-a="menu">Main Menu</button></div>`,this.ui.appendChild(a),this.finalEl=a,a.querySelector("[data-a=box]").addEventListener("click",()=>this.modals.boxScore(n)),a.querySelector("[data-a=again]").addEventListener("click",()=>this.settings&&this.startGame(this.settings)),a.querySelector("[data-a=menu]").addEventListener("click",()=>this.quitToMenu())}handleEvents(t){var a,o;const e=this.engine,n=this.hud,s=e.userSideBatting(),r=e.userSidePitching();for(const l of t)switch(l.type){case"batterUp":n.batterCard(e,ze(e.state));break;case"pitchingChange":{n.banner("PITCHING CHANGE",`${l.text} ${l.sub}`,"",1.8),n.pitcherCard(e,Ve(e.state));break}case"windup":this.replayPrompt=!1,n.hideLower3();break;case"pitchRelease":this.audio.play("pitch",.6);break;case"swing":this.audio.play("swing",.7);break;case"meterResult":n.feedback(l.text??"","PITCH METER",!1);break;case"contactResult":{const c=l.data;(s||!r)&&n.feedback(l.text,l.sub,c.contact,c.ev,c.la),c.contact&&(this.audio.play(c.quality>.7?"batCrackBig":"batCrack",.6+c.quality*.6),this.prefs.cameraShake&&c.ev>98&&this.renderer.shake(Math.min(1.6,(c.ev-95)/10)));break}case"call":{const c=l.data.call;c!=="foul"&&this.audio.play("glove",.8),c==="called_strike"&&this.audio.play("strikeCall"),c==="hbp"&&n.toast("HIT BY PITCH");break}case"strikeout":{const c=(a=l.data)==null?void 0:a.risp;n.banner("STRIKEOUT",c?"Huge K with runners in scoring position!":`${l.text} gets him`,s?"red":"gold",1.8),this.audio.play(Te(e.state).side==="home"?"crowdCheer":"crowdGroan",c?1.3:.8),this.notableThisPitch.push("strikeout");break}case"walk":n.toast("BALL FOUR",`${ze(e.state).name} draws a walk`);break;case"contact":break;case"play:catch":case"play:catchThrow":this.audio.play("glove");break;case"play:out":this.audio.play("outCall",.8);break;case"play:slide":this.audio.play("slide");break;case"play:error":n.toast("E — ERROR",`${l.data.pos} can't handle it`),this.audio.play("crowdGroan",.6);break;case"play:jump":break;case"homerun":{const c=l.data;n.homeRun(c.name,c.ev,c.la,c.dist),this.audio.play("crowdRoar"),this.hrCam=3.4,this.prefs.cameraShake&&this.renderer.shake(1.4);const u=Fe(e.state);u.side==="home"&&this.renderer.fireworks([u.team.colors.primary,u.team.colors.secondary,"#ffffff","#ffd34d"]);break}case"banner":{const c=(o=l.data)==null?void 0:o.kind;l.text?n.banner(l.text,l.sub??"",c==="big"?"gold":"",c==="small"?1.4:2):l.sub&&n.toast(l.sub),c==="hit"&&this.audio.play(Fe(e.state).side==="home"?"crowdCheer":"crowdGroan",.8),c==="big"&&this.audio.play("crowdCheer",1.2);break}case"runsScored":n.toast(l.text??""),this.audio.play(Fe(e.state).side==="home"?"crowdCheer":"crowdGroan",1);break;case"halfEnd":n.banner(l.text??"",l.sub??"","",2.4),this.audio.play("organ");break;case"toast":n.toast(l.text??"",l.sub??"");break;case"wildpitch":n.toast(l.text??"WILD PITCH","The ball gets away!");break;case"final":{n.banner(l.text??"FINAL",l.sub??"","gold",3),this.audio.play("crowdRoar",.8),setTimeout(()=>{this.engine===e&&!this.finalShown&&(this.finalShown=!0,this.showFinal(l.text??"FINAL",l.sub??""))},2600);break}}}viewFor(t){const e=t.phase,n=["atbat_intro","prepitch","windup","pitch","postpitch"].includes(e);let s="overview";n?s=t.userSidePitching()?"pitching":"batting":(e==="live"||e==="postplay")&&(s=this.hrCam>0?"hr":"field");const r=t.userSideBatting();let a=null;if(r&&n){const c=ze(t.state),u=this.ctrl.keys.has("Shift")?"power":this.ctrl.keys.has("Control")||this.ctrl.keys.has("Alt")?"contact":"normal",h=lh(c,u,t.swingMods()),d=t.swing?t.swing.pci:this.ctrl.pci;a={x:d.x,y:d.y,r:h,color:u==="power"?"#ff7a59":u==="contact"?"#7fd8ff":"#ffffff"}}let o=null;if(t.userSidePitching()&&(e==="prepitch"||e==="windup")){const c=t.userPitch;c.stage,o={x:c.target.x,y:c.target.y,color:c.stage==="locked"?"#ffd34d":"#ffffff"}}let l=null;return t.play&&t.play.controlled&&t.play.cfg.userDefense&&(l={x:t.play.controlled.x,z:t.play.controlled.z}),{mode:s,pci:a,zone:this.prefs.showStrikeZone&&(s==="batting"||s==="pitching"),target:o,focus:l,dimCatcher:s==="batting"}}updateScoreboard(t){var r;const e=t.state,n=a=>({abbr:e[a].team.id,line:e[a].linescore,r:e[a].runs,h:e[a].hits,e:e[a].errors,color:e[a].team.colors.primary});let s="";t.phase==="final"?s="FINAL":(r=t.lastOutcome)!=null&&r.homeRun&&(t.phase==="postplay"||t.phase==="live")?s="HOME RUN!":s=`${e.away.team.name.toUpperCase()} AT ${e.home.team.name.toUpperCase()}`,this.renderer.updateScoreboard({away:n("away"),home:n("home"),innings:e.settings.innings,inning:e.inning,half:e.half,balls:e.balls,strikes:e.strikes,outs:e.outs,batter:ze(e).name,pitcher:Ve(e).name,mph:t.flight?`${Math.round(t.flight.mph)} MPH`:"",message:s})}loop(t){var s,r,a;const e=Math.min(.05,(t-this.last)/1e3);this.last=t;const n=this.ctrl;if(this.mode==="game"&&this.engine&&this.hud){const o=this.engine;if(n.hit("Escape")&&(this.replay.active?(this.replay.close(),this.hud.hideGameplayRegions(!1)):this.modals.open?this.modals.close():this.finalShown||this.openPause()),this.replay.active)this.runReplay(e);else{if(!this.paused&&!this.modals.open){const c=!["live","pitch","windup"].includes(o.phase);if(n.hit("KeyR")&&c&&this.replay.open())this.hud.hideGameplayRegions(!0),this.renderer.camMgr.replay.yaw=.7,this.renderer.camMgr.replay.pitch=.35,this.renderer.camMgr.replay.dist=110;else{const u=Ve(o.state).pitcher,h=(s=o.play)==null?void 0:s.controlled,d=n.build(e,{userBatting:o.userSideBatting(),userPitching:o.userSidePitching()&&o.phase!=="live",repertoire:u.pitches,cameraAxes:()=>this.renderer.camMgr.groundAxes(),planePoint:(g,v,m)=>this.renderer.planePoint(g,v,m),pciPlaneZ:Ji,aimPlaneZ:ws,liveDefense:o.phase==="live"&&o.userSidePitching(),throwFill:h?.8+(100-h.player.ratings.arm)/300:1}),f=o.phase;o.update(e,d),this.trackReplay(o,f,e),this.handleEvents(o.drainEvents())}}this.hrCam>0&&(this.hrCam-=e),this.hud.update(o,{throwHold:n.throwHold,throwFill:(r=o.play)!=null&&r.controlled?.8+(100-o.play.controlled.player.ratings.arm)/300:1,swingPreview:n.keys.has("Shift")?"power":n.keys.has("Control")||n.keys.has("Alt")?"contact":"normal",runnerSel:n.runnerSel,replayAvailable:this.replayPrompt&&!["live","pitch","windup"].includes(o.phase)}),this.hud.tick(e),this.updateScoreboard(o);const l=this.viewFor(o);this.renderer.camMgr.setMode(l.mode,o.phase==="atbat_intro"&&o.phaseT<.05),this.renderer.frame(o.snapshot(),l,e)}}else this.renderer.camMgr.setMode("menu"),this.renderer.frame(null,{mode:"menu",pci:null,zone:!1,target:null,focus:null,dimCatcher:!1},e),n.hit("Escape")&&this.modals.open&&this.modals.close();this.touch&&this.touch.setMode(this.touchMode(),{steal:!!((a=this.engine)!=null&&a.state.bases.some(Boolean)),replay:this.mode==="game"&&this.replayPrompt&&!this.replay.active}),n.endFrame(),requestAnimationFrame(o=>this.loop(o))}touchMode(){const t=this.engine;if(this.mode!=="game"||!t)return"none";if(this.replay.active)return"replay";if(this.paused||this.modals.open||this.finalShown||t.phase==="final")return"none";const e=t.userSideBatting(),n=t.userSidePitching();return t.phase==="live"?n?"field":e?"run":"wait":t.phase==="prepitch"||t.phase==="windup"||t.phase==="pitch"?e?"bat":n&&t.phase==="prepitch"?"pitch":"wait":"wait"}trackReplay(t,e,n){const s=t.phase;if(s==="windup"&&e!=="windup"&&(this.replay.start(),this.notableThisPitch=[]),this.replay.recording&&this.replay.push(n,t.snapshot()),(e==="postplay"||e==="postpitch")&&s!==e&&this.replay.recording){const a=e==="postplay"?[...t.lastPlayNotable]:[];a.push(...this.notableThisPitch),this.replay.commit(a),this.replayPrompt=a.length>0}}runReplay(t){const e=this.ctrl,n=this.replay,s=this.renderer.camMgr.replay;if(e.hit("KeyR")){n.close(),this.hud.hideGameplayRegions(!1);return}e.hit("Space")&&(n.paused=!n.paused),e.hit("KeyZ")&&(n.speed=n.speed===1?.25:1),e.keys.has("ArrowLeft")&&n.scrub(-t*1.5),e.keys.has("ArrowRight")&&n.scrub(t*1.5),e.keys.has("KeyA")&&(s.yaw+=t*1.2),e.keys.has("KeyD")&&(s.yaw-=t*1.2),e.keys.has("KeyW")&&(s.dist=Math.max(12,s.dist*(1-t))),e.keys.has("KeyS")&&(s.dist=Math.min(420,s.dist*(1+t))),n.step(t);const r=n.frame();if(r){const a=r.ball,o=a.visible?Gt(a.x,Math.min(a.y,60),a.z):Gt(0,3,60);s.target.lerp(o,1-Math.exp(-4*t))}this.hud.replayUi(n.t,n.duration,n.paused,n.speed),this.renderer.camMgr.setMode("replay"),this.renderer.frame(r,{mode:"replay",pci:null,zone:!1,target:null,focus:null,dimCatcher:!1},n.paused?0:t*n.speed)}}const hx=new cx;window.__bb={app:hx,pitchPos:As,timeAtZ:Ls,CONTACT_Z:Ji,emptyInput:_h};
