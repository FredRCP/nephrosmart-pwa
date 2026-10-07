'use client';

import { useState } from 'react';

export default function ExcluirConta() {
  const [copied, setCopied] = useState(false);

  const email = 'nefrosmartapp@gmail.com';

  const handleCopy = () => {
    navigator.clipboard.writeText(email);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleEmailClick = () => {
    const subject = encodeURIComponent('Solicitação de Exclusão de Conta - NephroSmart');
    const body = encodeURIComponent(
      `Olá,\n\nGostaria de solicitar a exclusão da minha conta e de todos os meus dados pessoais do aplicativo NephroSmart.\n\nE-mail cadastrado: [SEU E-MAIL AQUI]\n\nAtenciosamente.`
    );
    window.location.href = `mailto:${email}?subject=${subject}&body=${body}`;
  };

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-2xl mx-auto">

        {/* Cabeçalho */}
        <div className="text-center mb-6  mt-6">
          <div className="flex justify-center mb-4">
            <div className="bg-red-100 p-4 rounded-full">
              <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
            Exclusão de Conta
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-lg">
            NephroSmart — RCP Creative
          </p>
        </div>

        {/* Card principal */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 mb-6">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
            Como solicitar a exclusão da sua conta
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
            Para solicitar a exclusão da sua conta e de todos os seus dados pessoais,
            envie um e-mail para o endereço abaixo. Sua solicitação será processada
            em até <strong>30 dias úteis</strong>.
          </p>

          {/* Passos */}
          <div className="space-y-4 mb-8">
            {[
              {
                step: '1',
                title: 'Envie um e-mail',
                desc: 'Use o botão abaixo ou copie o endereço de e-mail manualmente.',
              },
              {
                step: '2',
                title: 'Informe seu e-mail cadastrado',
                desc: 'No corpo do e-mail, inclua o endereço de e-mail utilizado no cadastro do NephroSmart.',
              },
              {
                step: '3',
                title: 'Aguarde a confirmação',
                desc: 'Você receberá uma confirmação em até 30 dias após o processamento da solicitação.',
              },
            ].map(({ step, title, desc }) => (
              <div key={step} className="flex gap-4 items-start">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm">
                  {step}
                </div>
                <div>
                  <p className="font-semibold text-gray-800 dark:text-white">{title}</p>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">{desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* E-mail de contato */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4 flex items-center justify-between mb-6">
            <div>
              <p className="text-xs text-gray-400 dark:text-gray-400 mb-1">E-mail para solicitação</p>
              <p className="font-semibold text-blue-600 dark:text-blue-400 text-lg">{email}</p>
            </div>
            <button
              onClick={handleCopy}
              className="flex items-center gap-2 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 text-gray-700 dark:text-white px-4 py-2 rounded-lg text-sm font-medium transition"
            >
              {copied ? (
                <>
                  <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Copiado!
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  Copiar
                </>
              )}
            </button>
          </div>

          {/* Botão principal */}
          <button
            onClick={handleEmailClick}
            className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-4 px-6 rounded-xl transition flex items-center justify-center gap-3 text-lg"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            Enviar solicitação por e-mail
          </button>
        </div>

        {/* Card informativo */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl p-6 mb-6">
          <h3 className="font-semibold text-blue-800 dark:text-blue-300 mb-3 flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            O que será excluído
          </h3>
          <ul className="space-y-2 text-sm text-blue-700 dark:text-blue-300">
            {[
              'Seus dados de autenticação (e-mail e senha)',
              'Seu perfil de usuário no Firebase',
              'Preferências e configurações salvas no app',
            ].map((item, i) => (
              <li key={i} className="flex items-center gap-2">
                <svg className="w-4 h-4 text-blue-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* Aviso LGPD */}
        <p className="text-center text-xs text-gray-400 dark:text-gray-500 leading-relaxed">
          Esta página está em conformidade com a{' '}
          <strong>Lei Geral de Proteção de Dados (LGPD — Lei nº 13.709/2018)</strong>.
          Para mais informações, consulte nossa{' '}
          <a href="/privacidade" className="text-blue-500 hover:underline">
            Política de Privacidade
          </a>.
        </p>

      </div>
    </div>
  );
}