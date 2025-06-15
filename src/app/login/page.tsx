'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

export default function LoginPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    phone: ''
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    setTimeout(() => {
      if (mounted) {
        // Check if admin login
        const isAdminLogin = formData.email === 'admin@moisushi.se';
        
        localStorage.setItem('auth-token', 'mock-jwt-token-123');
        localStorage.setItem('user-data', JSON.stringify({
          id: isAdminLogin ? 'admin-1' : '1',
          name: formData.name || (isAdminLogin ? 'Admin' : 'Test Användare'),
          email: formData.email,
          phone: formData.phone,
          role: isAdminLogin ? 'admin' : 'user'
        }));
        
        // Redirect based on role
        if (isAdminLogin) {
          router.push('/admin/bookings');
        } else {
          router.push('/profile');
        }
      }
      setIsLoading(false);
    }, 1500);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  if (!mounted) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        paddingTop: '80px', 
        backgroundColor: 'black', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center' 
      }}>
        <div style={{ 
          width: '48px', 
          height: '48px', 
          border: '2px solid #D4AF37', 
          borderTop: '2px solid transparent', 
          borderRadius: '50%', 
          animation: 'spin 1s linear infinite' 
        }}></div>
      </div>
    );
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      paddingTop: '80px', 
      backgroundColor: 'black', 
      color: 'white' 
    }}>
      <div style={{ 
        maxWidth: '400px', 
        margin: '0 auto', 
        padding: '40px 20px' 
      }}>
        {/* Logo och rubrik */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{ 
            position: 'relative', 
            width: '80px', 
            height: '80px', 
            margin: '0 auto 20px' 
          }}>
            <Image
              src="/branding/logo-transparent.png"
              alt="Moi Sushi"
              fill
              style={{ objectFit: 'contain' }}
            />
          </div>
          <h1 style={{ 
            fontSize: '32px', 
            fontWeight: 'bold', 
            marginBottom: '16px',
            color: 'white'
          }}>
            {isLogin ? 'Välkommen tillbaka!' : 'Gå med oss'}
          </h1>
          <p style={{ 
            fontSize: '16px', 
            color: '#9CA3AF' 
          }}>
            {isLogin 
              ? 'Logga in för att se din profil' 
              : 'Skapa ditt konto för bonuspoäng'
            }
          </p>
        </div>

        {/* Huvudkort */}
        <div style={{ 
          background: 'linear-gradient(145deg, rgba(212, 175, 55, 0.1), rgba(184, 134, 11, 0.1))',
          padding: '30px', 
          borderRadius: '12px',
          border: '1px solid rgba(212, 175, 55, 0.3)'
        }}>
          {/* Tab toggle */}
          <div style={{ 
            display: 'flex', 
            backgroundColor: '#374151', 
            borderRadius: '8px', 
            padding: '4px',
            marginBottom: '30px'
          }}>
            <button
              onClick={() => setIsLogin(true)}
              style={{
                flex: 1,
                padding: '12px 16px',
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: '600',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                backgroundColor: isLogin ? '#D4AF37' : 'transparent',
                color: isLogin ? 'black' : '#9CA3AF'
              }}
            >
              Logga In
            </button>
            <button
              onClick={() => setIsLogin(false)}
              style={{
                flex: 1,
                padding: '12px 16px',
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: '600',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                backgroundColor: !isLogin ? '#D4AF37' : 'transparent',
                color: !isLogin ? 'black' : '#9CA3AF'
              }}
            >
              Registrera
            </button>
          </div>

          {/* Formulär */}
          <form onSubmit={handleSubmit}>
            {/* Namn för registrering */}
            {!isLogin && (
              <div style={{ marginBottom: '20px' }}>
                <label style={{ 
                  display: 'block', 
                  fontSize: '14px', 
                  fontWeight: '600', 
                  color: '#D1D5DB',
                  marginBottom: '8px'
                }}>
                  Fullständigt namn
                </label>
                <input
                  type="text"
                  name="name"
                  placeholder="Ange ditt fullständiga namn"
                  value={formData.name}
                  onChange={handleInputChange}
                  required={!isLogin}
                  style={{
                    width: '100%',
                    height: '48px',
                    padding: '0 16px',
                    backgroundColor: '#374151',
                    border: '1px solid #4B5563',
                    borderRadius: '8px',
                    color: 'white',
                    fontSize: '16px',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
            )}

            {/* E-post */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ 
                display: 'block', 
                fontSize: '14px', 
                fontWeight: '600', 
                color: '#D1D5DB',
                marginBottom: '8px'
              }}>
                E-postadress
              </label>
              <input
                type="email"
                name="email"
                placeholder="din@email.com"
                value={formData.email}
                onChange={handleInputChange}
                required
                style={{
                  width: '100%',
                  height: '48px',
                  padding: '0 16px',
                  backgroundColor: '#374151',
                  border: '1px solid #4B5563',
                  borderRadius: '8px',
                  color: 'white',
                  fontSize: '16px',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            {/* Telefon för registrering */}
            {!isLogin && (
              <div style={{ marginBottom: '20px' }}>
                <label style={{ 
                  display: 'block', 
                  fontSize: '14px', 
                  fontWeight: '600', 
                  color: '#D1D5DB',
                  marginBottom: '8px'
                }}>
                  Telefonnummer
                </label>
                <input
                  type="tel"
                  name="phone"
                  placeholder="070-123 45 67"
                  value={formData.phone}
                  onChange={handleInputChange}
                  style={{
                    width: '100%',
                    height: '48px',
                    padding: '0 16px',
                    backgroundColor: '#374151',
                    border: '1px solid #4B5563',
                    borderRadius: '8px',
                    color: 'white',
                    fontSize: '16px',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
            )}

            {/* Lösenord */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ 
                display: 'block', 
                fontSize: '14px', 
                fontWeight: '600', 
                color: '#D1D5DB',
                marginBottom: '8px'
              }}>
                Lösenord
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  placeholder="••••••••••"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  style={{
                    width: '100%',
                    height: '48px',
                    padding: '0 50px 0 16px',
                    backgroundColor: '#374151',
                    border: '1px solid #4B5563',
                    borderRadius: '8px',
                    color: 'white',
                    fontSize: '16px',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '16px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: '#9CA3AF',
                    cursor: 'pointer',
                    fontSize: '14px'
                  }}
                >
                  {showPassword ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
            </div>

            {/* Glömt lösenord */}
            {isLogin && (
              <div style={{ textAlign: 'right', marginBottom: '24px' }}>
                <Link 
                  href="/forgot-password"
                  style={{ 
                    fontSize: '14px', 
                    color: '#D4AF37', 
                    textDecoration: 'none' 
                  }}
                >
                  Glömt lösenordet?
                </Link>
              </div>
            )}

            {/* Submit knapp */}
            <button
              type="submit"
              disabled={isLoading}
              style={{
                width: '100%',
                height: '48px',
                backgroundColor: '#D4AF37',
                color: 'black',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: 'bold',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                opacity: isLoading ? 0.7 : 1,
                marginBottom: '20px'
              }}
            >
              {isLoading ? (
                isLogin ? 'Loggar in...' : 'Skapar konto...'
              ) : (
                isLogin ? 'Logga In' : 'Skapa Konto'
              )}
            </button>

            {/* Villkor för registrering */}
            {!isLogin && (
              <div style={{ 
                padding: '16px', 
                backgroundColor: '#374151', 
                borderRadius: '8px',
                border: '1px solid #4B5563'
              }}>
                <p style={{ 
                  fontSize: '12px', 
                  color: '#9CA3AF', 
                  margin: 0,
                  lineHeight: '1.5'
                }}>
                  Genom att skapa ett konto godkänner du våra{' '}
                  <Link href="/terms" style={{ color: '#D4AF37' }}>
                    användarvillkor
                  </Link>{' '}
                  och{' '}
                  <Link href="/privacy" style={{ color: '#D4AF37' }}>
                    integritetspolicy
                  </Link>
                </p>
              </div>
            )}
          </form>
        </div>

        {/* Gäst alternativ */}
        <div style={{ textAlign: 'center', marginTop: '32px' }}>
          <div style={{ 
            position: 'relative', 
            marginBottom: '24px' 
          }}>
            <div style={{ 
              position: 'absolute', 
              top: '50%', 
              left: 0, 
              right: 0, 
              height: '1px', 
              backgroundColor: '#374151' 
            }}></div>
            <div style={{ 
              position: 'relative', 
              display: 'inline-block', 
              padding: '0 16px', 
              backgroundColor: 'black', 
              color: '#9CA3AF',
              fontSize: '14px'
            }}>
              eller fortsätt som gäst
            </div>
          </div>

          <Link
            href="/menu"
            style={{
              display: 'inline-block',
              width: '100%',
              height: '48px',
              lineHeight: '46px',
              backgroundColor: 'transparent',
              color: 'white',
              border: '1px solid #4B5563',
              borderRadius: '8px',
              textDecoration: 'none',
              fontSize: '16px',
              textAlign: 'center',
              transition: 'all 0.3s ease'
            }}
          >
            Beställ utan konto →
          </Link>

          <p style={{ 
            fontSize: '14px', 
            color: '#6B7280', 
            marginTop: '16px' 
          }}>
            Du kan alltid skapa ett konto senare
          </p>
        </div>

        {/* Demo info */}
        <div style={{ 
          marginTop: '32px', 
          padding: '20px', 
          background: 'linear-gradient(145deg, rgba(212, 175, 55, 0.1), rgba(184, 134, 11, 0.1))', 
          borderRadius: '12px',
          border: '1px solid rgba(212, 175, 55, 0.3)'
        }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
            <div style={{ 
              width: '32px', 
              height: '32px', 
              backgroundColor: '#D4AF37', 
              borderRadius: '50%', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              fontSize: '16px',
              flexShrink: 0
            }}>
              🧪
            </div>
            <div>
              <h3 style={{ 
                color: '#D4AF37', 
                fontSize: '16px', 
                fontWeight: 'bold', 
                marginBottom: '8px',
                margin: '0 0 8px 0'
              }}>
                Demo-läge
              </h3>
              <p style={{ 
                fontSize: '14px', 
                color: '#D1D5DB', 
                lineHeight: '1.5',
                margin: '0 0 12px 0'
              }}>
                Detta är en demo-version. Använd vilken e-post och lösenord som helst för att logga in.
                Din data sparas lokalt och skickas inte till några servrar.
              </p>
              <div style={{
                backgroundColor: 'rgba(212, 175, 55, 0.1)',
                border: '1px solid rgba(212, 175, 55, 0.3)',
                borderRadius: '8px',
                padding: '12px',
                fontSize: '12px',
                color: '#D1D5DB'
              }}>
                <strong style={{ color: '#D4AF37' }}>Admin-tillgång:</strong><br />
                E-post: <code style={{ color: '#D4AF37' }}>admin@moisushi.se</code><br />
                Lösenord: <em style={{ color: '#9CA3AF' }}>valfritt</em>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
} 