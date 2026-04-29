import Link from 'next/link'

export default function Home() {
  return (
    <section>
      

      <div>
        <Link href="/pacientes">
          <div className="card">
            <h3>PORTAL PACIENTES</h3>
            <p className="small-muted">Ver y otorgar permiso de acceso a tu expediente</p>
          </div>
        </Link>

        <Link href="/hospitales">
          <div className="card">
            <h3>PORTAL HOSPITALES (TRABAJADORES)</h3>
            <p className="small-muted">Solicitar acceso al expediente de un paciente</p>
          </div>
        </Link>
      </div>
    </section>
  )
}
