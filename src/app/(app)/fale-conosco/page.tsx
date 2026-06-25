import { Card } from "@/components/ui/Card";
import { Mail, MessageCircle } from "lucide-react";

export default function FaleConoscoPage() {
  return (
    <div className="flex flex-col gap-6 max-w-lg mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Fale conosco</h1>
        <p className="text-gray-500 text-sm mt-0.5">
          Estamos aqui para ajudar. Entre em contato para suporte, dúvidas ou sugestões.
        </p>
      </div>

      <Card>
        <div className="flex flex-col gap-5">
          <div className="flex items-start gap-4">
            <div className="bg-rose-50 p-2.5 rounded-xl shrink-0">
              <Mail size={20} className="text-rose-500" />
            </div>
            <div className="flex flex-col gap-1">
              <p className="text-sm font-semibold text-gray-700">E-mail de suporte</p>
              <p className="text-xs text-gray-400">
                Para dúvidas sobre o app, problemas técnicos ou questões sobre o Método Billings.
              </p>
              <a
                href="mailto:controlcycle.global@gmail.com"
                className="text-rose-500 font-medium text-sm hover:underline mt-1"
              >
                controlcycle.global@gmail.com
              </a>
            </div>
          </div>

          <hr className="border-gray-100" />

          <div className="flex items-start gap-4">
            <div className="bg-rose-50 p-2.5 rounded-xl shrink-0">
              <MessageCircle size={20} className="text-rose-500" />
            </div>
            <div className="flex flex-col gap-1">
              <p className="text-sm font-semibold text-gray-700">Sugestões e melhorias</p>
              <p className="text-xs text-gray-400">
                Tem uma ideia para melhorar o Control Cycle? Nos envie um e-mail com o assunto{" "}
                <span className="font-medium text-gray-600">"Sugestão"</span>.
              </p>
              <a
                href="mailto:controlcycle.global@gmail.com?subject=Sugest%C3%A3o%20-%20Control%20Cycle"
                className="text-rose-500 font-medium text-sm hover:underline mt-1"
              >
                Enviar sugestão
              </a>
            </div>
          </div>
        </div>
      </Card>

      <Card>
        <div className="flex flex-col gap-2">
          <p className="text-sm font-semibold text-gray-700">Horário de atendimento</p>
          <p className="text-sm text-gray-500">
            Segunda a sexta, das 9h às 18h (horário de Brasília).
            Respondemos em até 2 dias úteis.
          </p>
        </div>
      </Card>
    </div>
  );
}
