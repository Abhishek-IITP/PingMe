import {create} from "zustand"

export const useThemeStore = create((set)=>({
    theme: localStorage.getItem("PingMe-theme") ||"coffee",
    setTheme: (theme)=> {
        localStorage.setItem("PingMe-theme",theme)
        set({theme})},
}))