import React, { useState, useEffect, useRef } from 'react';
import Editor from '@monaco-editor/react';
import plantumlEncoder from 'plantuml-encoder';
import { Share2, Database, Code, Maximize2, Download, AlertCircle, PlusCircle, Network, Layers } from 'lucide-react';

const DEFAULT_CODE = `@startuml
' Define um tema mais agradavel visualmente
skinparam class {
    BackgroundColor White
    BorderColor #1e293b
    ArrowColor #3b82f6
    HeaderBackgroundColor #cbd5e1
}
skinparam shadowing false
hide circle
skinparam linetype ortho

' ==========================================
' MODELO ENTIDADE-RELACIONAMENTO (ER)
' 
' Dica: Use a sintaxe de classes do PlantUML 
' que lembra código C++ para modelar o Banco!
' ==========================================

entity "Cliente" as cliente {
  * id : INT <<PK>>
  --
  * nome : VARCHAR(100)
  email : VARCHAR(100)
}

entity "Pedido" as pedido {
  * id : INT <<PK>>
  --
  * cliente_id : INT <<FK>>
  * data_pedido : DATETIME
  valor_total : DECIMAL(10,2)
}

entity "Produto" as produto {
  * id : INT <<PK>>
  --
  * nome : VARCHAR(100)
  preco : DECIMAL(10,2)
}

entity "Pedido_Produto" as ped_prod {
  * pedido_id : INT <<FK>>
  * produto_id : INT <<FK>>
  --
  quantidade : INT
}

' ==========================================
' RELACIONAMENTOS E CARDINALIDADE
' ==========================================

' Um Cliente pode ter Vários Pedidos (1:N)
cliente ||--o{ pedido : "realiza"

' Relação N:N resolvida com Tabela Associativa
pedido ||--|{ ped_prod : "contém"
produto ||--o{ ped_prod : "está em"

@enduml`;

export default function App() {
  const [code, setCode] = useState(DEFAULT_CODE);
  const [imgUrl, setImgUrl] = useState('');
  const [error, setError] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);

  // Snippets
  const addEntitySnippet = () => {
    const snippet = `\nentity "NovaEntidade" as nova_ent {\n  * id : INT <<PK>>\n  --\n  campo : VARCHAR\n}\n`;
    setCode(prev => prev.replace('@enduml', '') + snippet + '\n@enduml');
  };

  const addOneToMany = () => {
    const snippet = `\nentidadeA ||--o{ entidadeB : "relacionamento 1:N"\n`;
    setCode(prev => prev.replace('@enduml', '') + snippet + '\n@enduml');
  };

  const addManyToMany = () => {
    const snippet = `\nentidadeA }o--o{ entidadeB : "relacionamento N:N"\n`;
    setCode(prev => prev.replace('@enduml', '') + snippet + '\n@enduml');
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        setIsUpdating(true);
        setError(null);
        // Clean encoding for PlantUML server
        const encoded = plantumlEncoder.encode(code);
        setImgUrl(\`https://www.plantuml.com/plantuml/svg/\${encoded}\`);
      } catch (err) {
        setError('Erro ao processar o código: ' + err.message);
      } finally {
        setIsUpdating(false);
      }
    }, 800); // debounce of 800ms
    
    return () => clearTimeout(timer);
  }, [code]);

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="header-title-group">
          <Database className="header-logo" size={28} />
          <div className="header-title">
            <h1>Modelador ER Dinâmico</h1>
            <p>Arquitetura de Dados - C++ / PlantUML Syntax</p>
          </div>
        </div>
        <div className="header-actions">
          <button className="btn btn-secondary" onClick={() => window.open(imgUrl, '_blank')}>
            <Download size={16} /> Exportar SVG
          </button>
          <button className="btn btn-primary" onClick={() => {
              navigator.clipboard.writeText(code);
              alert('Código copiado!');
          }}>
            <Share2 size={16} /> Copiar Código
          </button>
        </div>
      </header>

      <main className="workspace">
        <section className="editor-panel">
          <div className="panel-header">
            <div className="panel-title">
              <Code size={16} />
              <span>Código C++ / ER (Editor)</span>
            </div>
            <div className="snippet-buttons">
              <button className="btn-snippet" onClick={addEntitySnippet} title="Adicionar Entidade">
                <PlusCircle size={14} style={{ marginRight: '4px', verticalAlign: 'middle' }}/> 
                Entidade
              </button>
              <button className="btn-snippet" onClick={addOneToMany} title="Relacionamento 1:N">
                <Network size={14} style={{ marginRight: '4px', verticalAlign: 'middle' }}/>
                1:N
              </button>
              <button className="btn-snippet" onClick={addManyToMany} title="Relacionamento N:N">
                <Layers size={14} style={{ marginRight: '4px', verticalAlign: 'middle' }}/>
                N:N
              </button>
            </div>
          </div>
          <div className="editor-container">
            <Editor
              height="100%"
              defaultLanguage="cpp"
              theme="vs-dark"
              value={code}
              onChange={(value) => setCode(value || '')}
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                fontFamily: "'Fira Code', monospace",
                scrollBeyondLastLine: false,
                smoothScrolling: true,
                padding: { top: 16 }
              }}
            />
          </div>
        </section>

        <section className="preview-panel">
           <div className="panel-header" style={{backgroundColor: 'rgba(30, 41, 59, 0.8)', borderBottom: '1px solid rgba(255, 255, 255, 0.1)'}}>
            <div className="panel-title">
              <Maximize2 size={16} />
              <span>Graus de Cardinalidade & Relacionamentos</span>
              {isUpdating && <span style={{marginLeft: '10px', fontSize: '11px', color: 'var(--accent-color)'}}>Atualizando...</span>}
            </div>
          </div>
          
          {error && (
            <div className="error-banner">
              <AlertCircle size={18} />
              <div>{error}</div>
            </div>
          )}

          <div className="preview-content">
            {imgUrl ? (
              <img 
                src={imgUrl} 
                alt="Diagrama Entidade Relacionamento" 
                className="diagram-image" 
                onError={() => setError('Erro ao carregar imagem do servidor PlantUML. Verifique a sintaxe.')}
              />
            ) : (
              <div className="empty-state">
                <Database className="empty-state-icon" />
                <p>O diagrama aparecerá aqui automaticamente conforme você digita o código C++.</p>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
