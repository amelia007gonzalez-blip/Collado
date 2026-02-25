import { create } from 'zustand'

interface RadioState {
    isPlaying: boolean
    isLoading: boolean
    error: string | null
    toggle: () => void
    setIsLoading: (loading: boolean) => void
    setIsPlaying: (playing: boolean) => void
    setError: (error: string | null) => void
}

export const useRadioStore = create<RadioState>((set) => ({
    isPlaying: false,
    isLoading: false,
    error: null,
    setIsLoading: (loading) => set({ isLoading: loading }),
    setIsPlaying: (playing) => set({ isPlaying: playing }),
    setError: (error) => set({ error: error }),
    toggle: () => set((state) => ({ isPlaying: !state.isPlaying }))
}))

interface ChatState {
    activeRoom: string
    setActiveRoom: (room: string) => void
}

export const useChatStore = create<ChatState>((set) => ({
    activeRoom: 'General',
    setActiveRoom: (room) => set({ activeRoom: room })
}))
