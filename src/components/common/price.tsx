import clsx from 'clsx';

const Price = ({
  amount,
  className,
  currencyCode = 'TND',
  currencyCodeClassName
}: {
  amount: string;
  className?: string;
  currencyCode: string;
  currencyCodeClassName?: string;
} & React.ComponentProps<'p'>) => {
  
  // Handle Tunisian Dinar display
  if (currencyCode === 'DT' || currencyCode === 'TND') {
    const numericAmount = parseFloat(amount);
    return (
      <p suppressHydrationWarning={true} className={className}>
        {`${numericAmount.toFixed(2)} DT`}
      </p>
    );
  }
  
  // Handle other currencies with Intl.NumberFormat
  return (
    <p suppressHydrationWarning={true} className={className}>
      {`${new Intl.NumberFormat(undefined, {
        style: 'currency',
        currency: currencyCode,
        currencyDisplay: 'narrowSymbol'
      }).format(parseFloat(amount))}`}
      <span className={clsx('ml-1 inline', currencyCodeClassName)}>{`${currencyCode}`}</span>
    </p>
  );
};

export default Price;
