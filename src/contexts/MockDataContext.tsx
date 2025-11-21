"use client"

import React, { createContext, useContext, useState, useEffect } from 'react'

interface MockDataContextType {
    useMockData: boolean
    setUseMockData: (value: boolean) => void
}

const MockDataContext = createContext<MockDataContextType | undefined>(undefined)

export function MockDataProvider({ children }: { children: React.ReactNode }) {
    const [useMockData, setUseMockDataState] = useState(false)
    const [mounted, setMounted] = useState(false)

    // Load from localStorage on mount
    useEffect(() => {
        const stored = localStorage.getItem('useMockData')
        if (stored !== null) {
            setUseMockDataState(stored === 'true')
        }
        setMounted(true)
    }, [])

    // Save to localStorage when changed
    const setUseMockData = (value: boolean) => {
        setUseMockDataState(value)
        localStorage.setItem('useMockData', value.toString())
    }

    // Prevent hydration mismatch
    if (!mounted) {
        return <>{children}</>
    }

    return (
        <MockDataContext.Provider value={{ useMockData, setUseMockData }}>
            {children}
        </MockDataContext.Provider>
    )
}

export function useMockDataContext() {
    const context = useContext(MockDataContext)
    if (context === undefined) {
        throw new Error('useMockDataContext must be used within MockDataProvider')
    }
    return context
}
