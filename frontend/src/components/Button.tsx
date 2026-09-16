import React from 'react'

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary'|'ghost'|'danger' }

export default function Button({ variant='primary', className='', ...props }: Props){
  const base = 'px-4 py-2 rounded focus:outline-none'
  const variantClass = variant === 'primary' ? 'bg-primary text-white' : variant === 'danger' ? 'bg-danger text-white' : 'bg-white border'
  return <button className={`${base} ${variantClass} ${className}`} {...props} />
}
