import React, { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'

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
                style={{ width: '100%', paddingRight: '48px' }}
                required
            />
            <button
                type="button"
                onClick={() => setShow(!show)}
                style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '0',
                    color: '#94a3b8'
                }}
                tabIndex="-1"
            >
                {show ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
        </div>
    )
}
