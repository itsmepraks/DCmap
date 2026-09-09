export type BenchPart={material:'wood'|'dark';x:number;y:number;z:number;w:number;h:number;d:number}
/** Connected slatted park bench, in meters around its seat center. */
export function parkBenchParts(side:number):BenchPart[]{
 const parts:BenchPart[]=[],back=side*.28
 const add=(material:BenchPart['material'],x:number,y:number,z:number,w:number,h:number,d:number)=>parts.push({material,x,y,z,w,h,d})
 for(let slat=0;slat<5;slat++)add('wood',0,.49,-.25+slat*.12,1.9,.065,.105)
 for(let slat=0;slat<3;slat++)add('wood',0,.70+slat*.135,back,1.9,.105,.065)
 for(const x of [-.73,.73]){
   add('dark',x,.24,-.18,.065,.48,.065);add('dark',x,.49,back,.065,.98,.065)
   add('dark',x,.43,0,.075,.065,.6);add('dark',x,.65,-.18,.055,.32,.055);add('dark',x,.81,0,.07,.055,.6)
 }
 return parts
}
