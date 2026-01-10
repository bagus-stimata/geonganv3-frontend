// semua logic sticky tabbar ditaruh di sini
import { ref, onMounted, onBeforeUnmount, nextTick } from "vue"

export function useStickyTabbar(sections, threshold = 12) {
    const active = ref(sections.value[0]?.id || "")
    const isFloating = ref(false)
    const appBarRef = ref(null)
    const floatSentinel = ref(null)

    let observer
    let floatObserver

    const getCssVarPx = (name) =>
        parseFloat(getComputedStyle(document.documentElement).getPropertyValue(name)) || 0

    const detectAppTop = () => {
        const selectors = [
            "[data-app-menubar]",
            ".app-menubar",
            ".v-app-bar",
            "header[role='banner']",
            "header.site-header"
        ]
        for (const sel of selectors) {
            const el = document.querySelector(sel)
            if (!el) continue
            const cs = getComputedStyle(el)
            if (cs.position === "fixed" || cs.position === "sticky") {
                const h = el.getBoundingClientRect().height || el.offsetHeight || 0
                if (h > 0) return h
            }
        }
        return 0
    }

    const getHeaderOffset = () => {
        const el = appBarRef.value?.$el ?? appBarRef.value
        return el ? el.getBoundingClientRect().height : 64
    }

    const scrollTo = async (id) => {
        const target = document.getElementById(id)
        if (!target) return
        const offset = getHeaderOffset() + getCssVarPx("--app-top") + 8
        const y = target.getBoundingClientRect().top + window.scrollY - offset
        window.scrollTo({ top: y, behavior: "smooth" })
        history.replaceState(null, "", `#${id}`)
    }

    const observeFloat = async () => {
        if (floatObserver) floatObserver.disconnect()
        const sentinel = floatSentinel.value
        if (!sentinel) return
        const appTop = getCssVarPx("--app-top")
        floatObserver = new IntersectionObserver(
            (entries) => {
                for (const e of entries) {
                    isFloating.value = !e.isIntersecting
                }
            },
            {
                root: null,
                threshold: 0,
                rootMargin: `-${appTop + threshold}px 0px 0px 0px`
            }
        )
        floatObserver.observe(sentinel)
    }

    const observeActiveSection = () => {
        const offset = getHeaderOffset() + getCssVarPx("--app-top")
        observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((e) => {
                    if (e.isIntersecting) {
                        active.value = e.target.id
                    }
                })
            },
            {
                root: null,
                threshold: 0.3,
                rootMargin: `-${offset + threshold}px 0px -40% 0px`
            }
        )
        sections.value.forEach((s) => {
            const el = document.getElementById(s.id)
            if (el) observer.observe(el)
        })
    }

    const cleanupObserver = () => {
        if (observer) observer.disconnect()
    }

    const reobserve = async () => {
        cleanupObserver()
        const appTop = detectAppTop()
        document.documentElement.style.setProperty("--app-top", `${appTop}px`)
        const h = getHeaderOffset()
        document.documentElement.style.setProperty("--toolbar-h", `${h}px`)
        await observeFloat()
        await nextTick()
        observeActiveSection()
    }

    onMounted(async () => {
        await nextTick()
        const appTop = detectAppTop()
        document.documentElement.style.setProperty("--app-top", `${appTop}px`)
        const offset = getHeaderOffset() + 8
        document.documentElement.style.setProperty("--sticky-offset", `${offset}px`)
        const h = getHeaderOffset()
        document.documentElement.style.setProperty("--toolbar-h", `${h}px`)
        observeActiveSection()
        window.addEventListener("resize", reobserve)
        await observeFloat()
    })

    onBeforeUnmount(() => {
        cleanupObserver()
        if (floatObserver) floatObserver.disconnect()
        window.removeEventListener("resize", reobserve)
    })

    return { active, isFloating, appBarRef, floatSentinel, scrollTo, reobserve }
}