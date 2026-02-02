import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
// 👇 Troc amos o cliente do Supabase pelo nosso do Firebase
import { auth, db } from '@/lib/firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, onAuthStateChanged } from 'firebase/auth';
import { doc, setDoc, getDocs, query, where, collection } from 'firebase/firestore';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { Loader2, LogIn, UserPlus, CheckCircle2, XCircle } from 'lucide-react';
import logoExs from '@/assets/logo-exs-new.png';

const Auth = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  // Login state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Signup state
  const [signupNome, setSignupNome] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupTelefone, setSignupTelefone] = useState('');
  const [signupDocumento, setSignupDocumento] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupConfirmPassword, setSignupConfirmPassword] = useState('');

  // CNPJ Validation State
  const [validatingCNPJ, setValidatingCNPJ] = useState(false);
  const [cnpjStatus, setCnpjStatus] = useState<'idle' | 'valid' | 'invalid'>('idle');

  // 👇 Verificação de sessão (Adaptado para Firebase)
  const location = useLocation();
  // Get redirect path or default to home
  const from = location.state?.from?.pathname || "/";

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        navigate(from, { replace: true });
      }
    });
    return () => unsubscribe();
  }, [navigate, from]);

  // 👇 Validação de CNPJ
  const validateCNPJ = async (docValue: string) => {
    const numbers = docValue.replace(/\\D/g, '');

    // Se não for CNPJ (14 dígitos), reseta e retorna (pode ser CPF)
    if (numbers.length !== 14) {
      setCnpjStatus('idle');
      return;
    }

    setValidatingCNPJ(true);
    setCnpjStatus('idle');

    try {
      const response = await fetch(`https://open.cnpja.com/office/${numbers}`);

      if (!response.ok) {
        throw new Error('Falha na consulta');
      }

      const data = await response.json();

      if (data && (data.company || data.alias || data.name)) {
        setCnpjStatus('valid');
        const companyName = data.company?.name || data.alias || data.name;
        toast.success(`CNPJ Válido: ${companyName}`);

        // Auto-preencher nome se estiver vazio
        if (!signupNome) {
          setSignupNome(companyName);
        }
      } else {
        setCnpjStatus('invalid');
        toast.error('CNPJ não encontrado ou inválido.');
      }
    } catch (error) {
      console.error("Erro ao validar CNPJ:", error);
      // Em caso de erro na API, não bloqueamos, mas avisamos
      setCnpjStatus('invalid');
      toast.error('Não foi possível validar este CNPJ.');
    } finally {
      setValidatingCNPJ(false);
    }
  };

  // 👇 Lógica de Login (Firebase Auth)
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await signInWithEmailAndPassword(auth, loginEmail, loginPassword);
      toast.success('Login realizado com sucesso!');
      navigate(from, { replace: true });
    } catch (error: any) {
      console.error(error);
      if (error.code === 'auth/invalid-credential' || error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        toast.error('E-mail ou senha incorretos');
      } else {
        toast.error('Erro ao fazer login. Tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  // 👇 Lógica de Cadastro (Firebase Auth + Firestore) - COM LOGS
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('🚀 Iniciando cadastro...');

    // Só bloqueia se for CNPJ (14 dígitos) E estiver inválido
    // CPF (11 dígitos) pode prosseguir normalmente
    const documentoNumeros = signupDocumento.replace(/\\D/g, '');
    console.log('📄 Documento:', documentoNumeros, 'Length:', documentoNumeros.length);

    if (documentoNumeros.length === 14 && cnpjStatus === 'invalid') {
      console.log('❌ Bloqueado: CNPJ inválido');
      toast.error('Por favor, corrija o CNPJ antes de continuar.');
      return;
    }

    if (signupPassword !== signupConfirmPassword) {
      console.log('❌ Bloqueado: Senhas não coincidem');
      toast.error('As senhas não coincidem');
      return;
    }

    if (signupPassword.length < 6) {
      console.log('❌ Bloqueado: Senha muito curta');
      toast.error('A senha deve ter pelo menos 6 caracteres');
      return;
    }

    console.log('✅ Validações iniciais OK');
    setLoading(true);

    try {
      console.log('🔐 Criando usuário no Firebase Auth...');

      // 1. Cria o usuário na Autenticação (Firebase já valida email duplicado)
      const userCredential = await createUserWithEmailAndPassword(auth, signupEmail, signupPassword);
      const user = userCredential.user;
      console.log('✅ Usuário criado no Auth:', user.uid);

      // 2. Agora autenticado, verifica se CPF/CNPJ já existe
      console.log('🔍 Verificando se CPF/CNPJ já existe...');
      const qCpf = query(collection(db, "customers"), where("cpfCnpj", "==", signupDocumento));
      const querySnapshotCpf = await getDocs(qCpf);

      if (!querySnapshotCpf.empty) {
        console.log('❌ CPF/CNPJ já existe! Deletando usuário criado...');
        // Deleta o usuário recém-criado
        await user.delete();
        toast.error("Este CPF/CNPJ já está cadastrado.");
        setLoading(false);
        return;
      }

      // 3. Salva os dados do cliente no Firestore
      const customerData = {
        uid: user.uid,
        email: signupEmail,
        name: signupNome,
        phone: signupTelefone,
        cpfCnpj: signupDocumento,
        role: "user",
        active: true,
        createdAt: new Date(),
        source: 'EXS_Locacoes',
        permissions: [],
        roleId: 'CUSTOMER'
      };

      console.log('💾 Salvando dados no Firestore...');
      await setDoc(doc(db, "customers", user.uid), customerData);
      console.log('✅ Dados salvos com sucesso!');

      toast.success('Cadastro realizado com sucesso!');
      // O onAuthStateChanged vai redirecionar automaticamente
    } catch (error: any) {
      console.error('❌ Erro durante cadastro:', error);
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);

      if (error.code === 'auth/email-already-in-use') {
        toast.error('Este e-mail já está cadastrado');
      } else if (error.code === 'permission-denied') {
        toast.error('Erro de permissão no banco de dados. Contate o suporte.');
      } else {
        toast.error('Erro ao criar conta: ' + error.message);
      }
    } finally {
      setLoading(false);
      console.log('🏁 Processo de cadastro finalizado');
    }
  };

  // 👇 Funções utilitárias mantidas idênticas
  const formatDocumento = (value: string) => {
    const numbers = value.replace(/\\D/g, '');
    if (numbers.length <= 11) {
      // CPF: 000.000.000-00
      return numbers
        .replace(/(\\d{3})(\\d)/, '$1.$2')
        .replace(/(\\d{3})(\\d)/, '$1.$2')
        .replace(/(\\d{3})(\\d{1,2})$/, '$1-$2');
    } else {
      // CNPJ: 00.000.000/0000-00
      return numbers
        .replace(/(\\d{2})(\\d)/, '$1.$2')
        .replace(/(\\d{3})(\\d)/, '$1.$2')
        .replace(/(\\d{3})(\\d)/, '$1/$2')
        .replace(/(\\d{4})(\\d{1,2})$/, '$1-$2');
    }
  };

  const formatTelefone = (value: string) => {
    const numbers = value.replace(/\\D/g, '');
    if (numbers.length <= 10) {
      return numbers
        .replace(/(\\d{2})(\\d)/, '($1) $2')
        .replace(/(\\d{4})(\\d)/, '$1-$2');
    } else {
      return numbers
        .replace(/(\\d{2})(\\d)/, '($1) $2')
        .replace(/(\\d{5})(\\d)/, '$1-$2');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/30 p-4">
      <Card className="w-full max-w-md shadow-xl border-border/50">
        <CardHeader className="text-center space-y-4">
          <img src={logoExs} alt="EXS Solutions" className="h-16 mx-auto" />
          <div>
            <CardTitle className="text-2xl">Bem-vindo</CardTitle>
            <CardDescription>Acesse sua conta ou cadastre-se</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="login" className="gap-2">
                <LogIn className="h-4 w-4" />
                Entrar
              </TabsTrigger>
              <TabsTrigger value="signup" className="gap-2">
                <UserPlus className="h-4 w-4" />
                Cadastrar
              </TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-email">E-mail</Label>
                  <Input
                    id="login-email"
                    type="email"
                    placeholder="seu@email.com"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="login-password">Senha</Label>
                  <Input
                    id="login-password"
                    type="password"
                    placeholder="••••••••"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Entrando...
                    </>
                  ) : (
                    <>
                      <LogIn className="mr-2 h-4 w-4" />
                      Entrar
                    </>
                  )}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup">
              <form onSubmit={handleSignup} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-nome">Nome completo</Label>
                  <Input
                    id="signup-nome"
                    type="text"
                    placeholder="Seu nome"
                    value={signupNome}
                    onChange={(e) => setSignupNome(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-email">E-mail</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="seu@email.com"
                    value={signupEmail}
                    onChange={(e) => setSignupEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-telefone">Telefone</Label>
                  <Input
                    id="signup-telefone"
                    type="tel"
                    placeholder="(00) 00000-0000"
                    value={signupTelefone}
                    onChange={(e) => setSignupTelefone(formatTelefone(e.target.value))}
                    maxLength={15}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-documento">CPF / CNPJ</Label>
                  <div className="relative">
                    <Input
                      id="signup-documento"
                      type="text"
                      placeholder="000.000.000-00 ou 00.000.000/0000-00"
                      value={signupDocumento}
                      onChange={(e) => {
                        const val = formatDocumento(e.target.value);
                        setSignupDocumento(val);
                        // Reseta status se mudar o valor
                        if (cnpjStatus !== 'idle') setCnpjStatus('idle');
                      }}
                      onBlur={(e) => validateCNPJ(e.target.value)}
                      maxLength={18}
                      required
                      className={
                        cnpjStatus === 'valid'
                          ? 'border-green-500 pr-10'
                          : cnpjStatus === 'invalid'
                            ? 'border-red-500 pr-10'
                            : ''
                      }
                    />
                    {validatingCNPJ && (
                      <div className="absolute right-3 top-2.5">
                        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                      </div>
                    )}
                    {!validatingCNPJ && cnpjStatus === 'valid' && (
                      <div className="absolute right-3 top-2.5">
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                      </div>
                    )}
                    {!validatingCNPJ && cnpjStatus === 'invalid' && (
                      <div className="absolute right-3 top-2.5">
                        <XCircle className="h-4 w-4 text-red-500" />
                      </div>
                    )}
                  </div>
                  {cnpjStatus === 'invalid' && (
                    <p className="text-xs text-red-500 mt-1">CNPJ não encontrado ou inválido.</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password">Senha</Label>
                  <Input
                    id="signup-password"
                    type="password"
                    placeholder="Mínimo 6 caracteres"
                    value={signupPassword}
                    onChange={(e) => setSignupPassword(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-confirm-password">Confirmar senha</Label>
                  <Input
                    id="signup-confirm-password"
                    type="password"
                    placeholder="Repita a senha"
                    value={signupConfirmPassword}
                    onChange={(e) => setSignupConfirmPassword(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading || validatingCNPJ}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Cadastrando...
                    </>
                  ) : (
                    <>
                      <UserPlus className="mr-2 h-4 w-4" />
                      Cadastrar
                    </>
                  )}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;