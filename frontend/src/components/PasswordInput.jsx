import React, { useState } from 'react'

export default function PasswordInput({ value, onChange, placeholder = "Password", name = "password" }) {
    const [show, setShow] = useState(false)

    return (
        <div style={{ position: 'relative', width: '100%' }}>
            <input
                type={show ? "text" : "password"}
                value={value}
                onChange={onChange}
                name={name}
                placeholder={placeholder}
                style={{ width: '100%', paddingRight: '40px' }}
                required
            />
            <button
                type="button"
                onClick={() => setShow(!show)}
                style={{
                    position: 'absolute',
                    right: '5px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '1.2em',
                    padding: '0',
                    lineHeight: '1',
                    color: '#777'
                }}
                tabIndex="-1"
            >
                {show ? '🙈' : '👁️'}
            </button>
        </div>
    )
}
