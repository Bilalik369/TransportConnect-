import clsx from "clsx"

const Card = ({ children, className, hover = true, ...props }) => {
  return (
    <div className={clsx("card p-6", hover && "hover:shadow-xl hover:-translate-y-1", className)} {...props}>
      {children}
    </div>
  )
}

export default Card
