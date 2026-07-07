import { router } from "expo-router";
import { Pressable,StyleSheet,View } from "react-native";
import { AppText,Card,MutedText } from "@/components/ui";
import { useEmpire } from "@/contexts/empire";
import { useEmpireTheme } from "@/contexts/theme";
import type { ToolSummary } from "@/types/api";
export function ToolCard({tool}:{tool:ToolSummary}){const {direction}=useEmpire();const {colors}=useEmpireTheme();const price=tool.pricingMode==="free"?(direction==="rtl"?"مجاني":"Free"):tool.pricingMode==="fixed"?`${tool.fixedPoints} pts`:`${direction==="rtl"?"من":"From"} ${tool.minimumPoints} pts`;return <Pressable onPress={()=>router.push(`/tool/${tool.slug}`)}>{({pressed})=><Card style={{opacity:pressed?.8:1}}><View style={[styles.icon,{backgroundColor:`${colors.primary}18`}]}><AppText style={[styles.iconText,{color:colors.primary}]}>{tool.engineType.startsWith("ai_")?"AI":"↗"}</AppText></View><AppText style={styles.title}>{tool.title}</AppText><MutedText numberOfLines={3}>{tool.description}</MutedText><View style={styles.meta}><MutedText style={styles.metaText}>{tool.engineType.replaceAll("_"," ")}</MutedText><AppText style={[styles.price,{color:colors.primary}]}>{price}</AppText></View></Card>}</Pressable>}
const styles=StyleSheet.create({icon:{width:52,height:52,borderRadius:16,alignItems:"center",justifyContent:"center"},iconText:{fontWeight:"900"},title:{fontWeight:"900",fontSize:20},meta:{flexDirection:"row",justifyContent:"space-between",alignItems:"center",gap:12},metaText:{fontSize:12,textTransform:"uppercase"},price:{fontSize:12,fontWeight:"900"}});
