'use client';

import Image from 'next/image';
import { useState } from 'react';

const SSLTestComponent = () => {
  const [imgError, setImgError] = useState(false);
  const [nextImageError, setNextImageError] = useState(false);

  // URL com certificado SSL expirado (mencionada pelo usuário)
  const problematicUrl = 'https://www.appengine.ai/uploads/images/profile/logo/Anyword-AI.png';
  
  // URL válida (atual no código)
  const validUrl = 'https://aial-prod.s3.eu-central-1.amazonaws.com/agents/anyword.webp';

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-bold mb-4">Teste de Comportamento SSL</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Teste com URL problemática */}
        <div className="border p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-3 text-red-600">
            URL com SSL Expirado
          </h3>
          <p className="text-sm text-gray-600 mb-3 break-all">
            {problematicUrl}
          </p>
          
          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Tag &lt;img&gt; tradicional:</h4>
              <div className="border-2 border-dashed border-gray-300 p-2 h-20 flex items-center justify-center">
                {!imgError ? (
                  <img 
                    src={problematicUrl}
                    alt="Teste SSL - img tag"
                    className="max-h-16 max-w-16 object-contain"
                    onError={() => setImgError(true)}
                  />
                ) : (
                  <span className="text-red-500 text-sm">❌ Erro ao carregar</span>
                )}
              </div>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">Next.js Image:</h4>
              <div className="border-2 border-dashed border-gray-300 p-2 h-20 flex items-center justify-center">
                {!nextImageError ? (
                  <Image 
                    src={problematicUrl}
                    alt="Teste SSL - Next Image"
                    width={64}
                    height={64}
                    className="object-contain"
                    unoptimized={true}
                    onError={() => setNextImageError(true)}
                  />
                ) : (
                  <span className="text-red-500 text-sm">❌ Erro ao carregar</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Teste com URL válida */}
        <div className="border p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-3 text-green-600">
            URL com SSL Válido
          </h3>
          <p className="text-sm text-gray-600 mb-3 break-all">
            {validUrl}
          </p>
          
          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Tag &lt;img&gt; tradicional:</h4>
              <div className="border-2 border-dashed border-gray-300 p-2 h-20 flex items-center justify-center">
                <img 
                  src={validUrl}
                  alt="Teste SSL válido - img tag"
                  className="max-h-16 max-w-16 object-contain"
                />
              </div>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">Next.js Image:</h4>
              <div className="border-2 border-dashed border-gray-300 p-2 h-20 flex items-center justify-center">
                <Image 
                  src={validUrl}
                  alt="Teste SSL válido - Next Image"
                  width={64}
                  height={64}
                  className="object-contain"
                  unoptimized={true}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-blue-50 p-4 rounded-lg">
        <h3 className="font-semibold mb-2">📋 Explicação do Problema:</h3>
        <ul className="list-disc list-inside space-y-1 text-sm">
          <li><strong>Next.js Image:</strong> Valida certificados SSL rigorosamente e falha com certificados expirados</li>
          <li><strong>Tag &lt;img&gt;:</strong> Mais permissiva, pode carregar imagens mesmo com problemas de SSL</li>
          <li><strong>Tela Admin:</strong> Usa &lt;img&gt; tradicional, por isso funciona</li>
          <li><strong>Página Principal:</strong> Usa Next.js Image, por isso falha com SSL inválido</li>
        </ul>
      </div>

      <div className="bg-yellow-50 p-4 rounded-lg">
        <h3 className="font-semibold mb-2">💡 Soluções:</h3>
        <ul className="list-disc list-inside space-y-1 text-sm">
          <li>Atualizar URLs para versões com certificados SSL válidos</li>
          <li>Usar &lt;img&gt; tradicional para URLs problemáticas</li>
          <li>Implementar proxy para imagens externas</li>
          <li>Configurar fallbacks adequados</li>
        </ul>
      </div>
    </div>
  );
};

export default SSLTestComponent;