import React from 'react'
import { Outlet } from 'react-router-dom'

function CourseStream() {
    return (
        <>
            <h1>CourseStream</h1>
            <Outlet></Outlet>
        </>
    )
}

export default CourseStream
