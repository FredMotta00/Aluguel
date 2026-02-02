import { Link } from 'react-router-dom';
import { Instagram, Youtube, Linkedin, Mail, Phone, MapPin } from 'lucide-react';
import logoExs from '@/assets/logo-exs-new.png';

const Footer = () => {
    return (
        <footer className="bg-slate-950 text-slate-400 py-12 border-t border-white/5 rounded-none mt-auto">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {/* Logo & Description */}
                    <div className="space-y-4">
                        <Link to="/" className="inline-block">
                            <img src={logoExs} alt="EXS Solutions" className="h-12 w-auto mb-2" />
                        </Link>
                        <p className="text-sm leading-relaxed">
                            EXS Solutions - Excelência em tecnologia e inovação para o seu negócio. Locação e venda de equipamentos de alta performance.
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div className="space-y-4">
                        <h4 className="text-white font-bold uppercase tracking-wider text-sm">Navegação</h4>
                        <ul className="space-y-2 text-sm">
                            <li><Link to="/" className="hover:text-primary transition-colors">Home</Link></li>
                            <li><Link to="/planos" className="hover:text-primary transition-colors">Planos</Link></li>
                            <li><Link to="/pacotes" className="hover:text-primary transition-colors">Pacotes</Link></li>
                            <li><Link to="/fidelidade" className="hover:text-primary transition-colors">Fidelidade</Link></li>
                            <li><Link to="/minha-conta" className="hover:text-primary transition-colors">Minha Conta</Link></li>
                            <li><Link to="/carrinho" className="hover:text-primary transition-colors">Carrinho</Link></li>
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div className="space-y-4">
                        <h4 className="text-white font-bold uppercase tracking-wider text-sm">Contato Comercial</h4>
                        <ul className="space-y-3 text-sm">
                            <li className="flex items-center gap-3">
                                <Mail className="h-4 w-4 text-primary" />
                                <a href="mailto:comercial@gpecx.com.br" className="hover:text-white transition-colors">comercial@gpecx.com.br</a>
                            </li>
                            <li className="flex items-center gap-3">
                                <Phone className="h-4 w-4 text-primary" />
                                <a href="tel:+5519971290901" className="hover:text-white transition-colors">19 97129-0901</a>
                            </li>
                            <li className="flex items-start gap-3">
                                <MapPin className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                                <span>R. Antônio Gonzáles Vasques, 126 - Bosque da Saude, Americana - SP</span>
                            </li>
                        </ul>
                    </div>

                    {/* Social Media */}
                    <div className="space-y-4">
                        <h4 className="text-white font-bold uppercase tracking-wider text-sm">Siga-nos</h4>
                        <div className="flex gap-4">
                            <a
                                href="https://www.instagram.com/gpecx/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="bg-white/5 p-2 rounded-none hover:bg-primary hover:text-white transition-all"
                            >
                                <Instagram className="h-5 w-5" />
                            </a>
                            <a
                                href="https://www.youtube.com/@grupogpecx4251"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="bg-white/5 p-2 rounded-none hover:bg-primary hover:text-white transition-all"
                            >
                                <Youtube className="h-5 w-5" />
                            </a>
                            <a
                                href="https://www.linkedin.com/company/gpecx/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="bg-white/5 p-2 rounded-none hover:bg-primary hover:text-white transition-all"
                            >
                                <Linkedin className="h-5 w-5" />
                            </a>
                        </div>
                    </div>
                </div>

                <div className="mt-12 pt-8 border-t border-white/5 text-center text-xs">
                    <p>© {new Date().getFullYear()} EXS Solutions. Todos os direitos reservados. GPECx Tecnologia.</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
