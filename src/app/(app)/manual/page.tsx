import { Card } from "@/components/ui/Card";

interface SecaoProps {
  titulo: string;
  children: React.ReactNode;
}

function Secao({ titulo, children }: SecaoProps) {
  return (
    <section>
      <h2 className="text-lg font-semibold text-rose-700 mb-3">{titulo}</h2>
      <div className="text-sm text-gray-700 leading-relaxed space-y-2">{children}</div>
    </section>
  );
}

export default function ManualPage() {
  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Manual MOB</h1>
        <p className="text-gray-500 text-sm mt-0.5">
          Referência básica do Método de Ovulação Billings
        </p>
      </div>

      {/* Aviso importante — destacado no topo */}
      <Card className="bg-amber-50 border-amber-200">
        <p className="text-sm font-semibold text-amber-800 mb-1">Aviso importante</p>
        <p className="text-sm text-amber-700">
          O Control Cycle não substitui o aprendizado formal do MOB, nem o acompanhamento de uma
          instrutora. Esta primeira versão tem finalidade exclusiva de registro, organização e
          visualização das suas observações. Consulte sempre uma instrutora certificada do MOB.
        </p>
      </Card>

      <Card padding="lg">
        <div className="flex flex-col gap-8">

          <Secao titulo="Introdução">
            <p>
              O Control Cycle é um caderno digital para apoiar o registro diário das observações
              do Método de Ovulação Billings. O aplicativo ajuda a organizar as informações do
              ciclo em formato de gráfico, facilitando a visualização, o histórico e o
              compartilhamento com uma instrutora.
            </p>
          </Secao>

          <Secao titulo="O que é o Método de Ovulação Billings (MOB)?">
            <p>
              O Método de Ovulação Billings é um método natural de planejamento familiar baseado
              na observação diária da sensação vulvar e da aparência do muco cervical. A usuária
              registra diariamente o que sente e o que vê, formando um gráfico do ciclo.
            </p>
            <p>
              O método é reconhecido pela Organização Mundial da Saúde (OMS) e é ensinado por
              instrutoras certificadas em todo o mundo.
            </p>
          </Secao>

          <Secao titulo="Como registrar diariamente">
            <p>
              A anotação deve ser feita <strong>todos os dias</strong>, preferencialmente ao
              final do dia, considerando as percepções observadas ao longo das atividades normais.
            </p>
            <ul className="list-disc list-inside space-y-1 pl-2">
              <li>Observe a sensação na vulva durante o dia.</li>
              <li>Observe o que aparece na roupa íntima ou ao se limpar.</li>
              <li>Registre no aplicativo antes de dormir.</li>
            </ul>
          </Secao>

          <Secao titulo="O que é Sensação?">
            <p>
              Sensação é aquilo que a mulher percebe na vulva durante as atividades normais,
              sem precisar fazer um exame interno. As principais sensações são:
            </p>
            <ul className="list-disc list-inside space-y-1 pl-2">
              <li><strong>Seca:</strong> nenhuma percepção de umidade.</li>
              <li><strong>Úmida:</strong> percepção leve de umidade, sem escorregamento.</li>
              <li><strong>Molhada:</strong> percepção clara de umidade.</li>
              <li><strong>Escorregadia / Lisa / Lubrificada:</strong> sensação de lubrificação, associada ao muco fértil.</li>
            </ul>
          </Secao>

          <Secao titulo="O que é Aparência?">
            <p>
              Aparência é aquilo que a mulher vê na roupa íntima ou ao se limpar com papel
              higiênico. As principais observações são:
            </p>
            <ul className="list-disc list-inside space-y-1 pl-2">
              <li><strong>Nada:</strong> sem percepção visual.</li>
              <li><strong>Sangue / Mancha:</strong> sangramento menstrual ou pequena mancha.</li>
              <li><strong>Muco branco / cremoso / pegajoso:</strong> muco típico do período pré-ovulatório.</li>
              <li><strong>Muco transparente / elástico / tipo clara de ovo:</strong> muco fértil, próximo à ovulação.</li>
            </ul>
          </Secao>

          <Secao titulo="O que é PBI?">
            <p>
              PBI significa <strong>Padrão Básico de Infertilidade</strong>. É o padrão de
              sensação e aparência que se repete de forma consistente em cada mulher durante os
              dias inférteis. Pode ser um padrão seco ou um padrão com muco de aparência sempre
              igual.
            </p>
            <p>
              Identificar o PBI é fundamental para usar o método corretamente. A orientação
              deve ser feita com uma instrutora.
            </p>
          </Secao>

          <Secao titulo="Regras dos Primeiros Dias">
            <p>
              As Regras dos Primeiros Dias (Regras 1, 2 e 3) orientam o uso do método nos dias
              anteriores ao aparecimento do muco. O conteúdo detalhado e a aplicação prática
              devem ser aprendidos com uma instrutora certificada do MOB.
            </p>
          </Secao>

          <Secao titulo="Regra do Ápice">
            <p>
              O <strong>ápice</strong> é o último dia de sensação de fertilidade — o dia com a
              maior percepção de lubrificação/escorregamento ou com muco mais elástico. A
              identificação do ápice é feita retrospectivamente (no dia seguinte, quando a
              sensação muda).
            </p>
            <p>
              A Regra do Ápice determina os dias de segurança após o ápice. Essa identificação
              deve ser feita com conhecimento do método e, idealmente, com acompanhamento de
              instrutora.
            </p>
          </Secao>

          <Secao titulo="Explicação dos Símbolos">
            <div className="grid grid-cols-1 gap-2">
              {[
                { cor: "bg-red-500", texto: "Vermelho", desc: "Sangramento ou menstruação." },
                { cor: "bg-green-500", texto: "Verde", desc: "Dia seco — sem percepção de muco." },
                { cor: "bg-yellow-400", texto: "Amarelo", desc: "Padrão de fluxo que se repete (PBI com muco)." },
                { cor: "bg-gray-100 border border-gray-200", texto: "Branco", desc: "Possível fertilidade — sensação lubrificada." },
                /*{ cor: "bg-purple-500", texto: "R1 / R2 / R3", desc: "Marcações relacionadas às Regras dos Primeiros Dias." },*/
                { cor: "bg-gray-500", texto: "1 / 2 / 3", desc: "Contagem após o ápice ou retorno ao PBI." },
              ].map((item) => (
                <div key={item.texto} className="flex items-start gap-3">
                  <div className={`w-8 h-8 rounded-lg shrink-0 ${item.cor}`} />
                  <div>
                    <span className="font-medium text-gray-700">{item.texto}:</span>{" "}
                    <span className="text-gray-500">{item.desc}</span>
                  </div>
                </div>
              ))}
            </div>
          </Secao>

        </div>
      </Card>
    </div>
  );
}
